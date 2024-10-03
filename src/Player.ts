/* eslint-disable no-async-promise-executor */
import { CraftSchemaSkillEnum, InventorySlot, ItemEffectSchema, ItemSchema, MonsterSchema, ResourceSchemaSkillEnum } from 'artifactsmmo-sdk'
import BasePlayer from './Actions'
import { findMapsWithContent, getClosestMapFromDestination } from './Maps'
import { findResourceBySkill } from './Resources'
import { fromCoordinatesToDestination, getLowestTenOfLevel } from './Utils'
import { resolve } from 'path'
import { findItemsBySkill, findItemsByType, getItemsInBank } from './Items'
import { findMonsterByName } from './Monsters'
import { ERROR_CODE_STILL_IN_COOLDOWN, ERROR_CODE_SLOT_EMPTY } from './Const'

export default class Player extends BasePlayer {
    gatherResource(resourceSkill: ResourceSchemaSkillEnum, resourceLevel: number = -1) {
        return new Promise<void>(async resolve => {
            if (resourceLevel < 0) resourceLevel = getLowestTenOfLevel(this.getMyLevelOfSkill(resourceSkill))
            console.log(`${this.me.name}: Try action gather resource ${resourceSkill} of level ${resourceLevel}`)
            const resourceToGather = (await findResourceBySkill(resourceSkill, resourceLevel))[0] ?? null
            if (resourceToGather === null) {
                console.error(`Could not find resource ${resourceToGather} in DB`)
                resolve()
                return
            }

            const mapsWhereResourceIsPresent = await findMapsWithContent(resourceToGather.code)
            const mapToGatherResource = await getClosestMapFromDestination(mapsWhereResourceIsPresent, fromCoordinatesToDestination(this.me.x, this.me.y))
            console.log(`${this.me.name}: Start gathering resource '${resourceToGather.name}' at ${mapToGatherResource._id}`)

            await this.emptyInventoryInBank()
            await this.changeWeaponForTool(resourceSkill)
            await this.moveTo(mapToGatherResource.x, mapToGatherResource.y)
            while (this.getCurrentInventoryLevel() < this.me.inventory_max_items) {
                await this.gather().catch(async () => {
                    await this.handleActionErrorNotFound(mapToGatherResource.x, mapToGatherResource.y)
                })
            }
            console.log(`${this.me.name}: Inventory full`)
            await this.emptyInventoryInBank().then(resolve)
        })
    }

    craftItems(craftSkill: CraftSchemaSkillEnum, craftLevel: number = -1): Promise<void> {
        return new Promise<void>(async resolve => {
            if (craftLevel < 0) craftLevel = this.getMyLevelOfSkill(craftSkill)
            const minCraftLevel = getLowestTenOfLevel(craftLevel)
            console.log(`${this.me.name}: Try action craft item ${craftSkill}, from ${minCraftLevel} to ${craftLevel}`)
            const craftsOfThatLevel = await findItemsBySkill(craftSkill, minCraftLevel, craftLevel)
            const itemsInBank = await getItemsInBank()

            const possibleCrafts: PossibleCraft[] = []
            craftsOfThatLevel.forEach(craftOfThatLevel => {
                let isPossibleToCraft = true
                if (craftOfThatLevel.craft === undefined || craftOfThatLevel.craft === null || craftOfThatLevel.craft.items === undefined) return
                let quantityOfResourceToSpend = 0
                craftOfThatLevel.craft.items.forEach(itemRequiredForCraft => {
                    quantityOfResourceToSpend += itemRequiredForCraft.quantity
                    let itemsPresentInBank = false
                    itemsInBank.forEach(itemInBank => {
                        if (itemRequiredForCraft.code === itemInBank.code && itemRequiredForCraft.quantity <= itemInBank.quantity) itemsPresentInBank = true
                    })
                    if (!itemsPresentInBank) isPossibleToCraft = false
                })
                if (isPossibleToCraft) possibleCrafts.push({ ...craftOfThatLevel, total_resources_to_spend: quantityOfResourceToSpend })
            })

            if (possibleCrafts.length < 1) {
                console.log(`${this.me.name}: No possible craft found among`, craftsOfThatLevel)
                resolve()
                return
            }

            let craftToDo: PossibleCraft = possibleCrafts[0]
            possibleCrafts.forEach(possibleCraft => {
                if (craftToDo.total_resources_to_spend > possibleCraft.total_resources_to_spend) craftToDo = possibleCraft
            })

            if (craftToDo.craft === undefined || craftToDo.craft === null || craftToDo.craft.items === undefined) {
                console.log(`${craftToDo.code} does not have craft recipes ?`, craftToDo)
                resolve()
                return
            }

            console.log(`${this.me.name}: Let's craft `, craftToDo.code, craftToDo.craft.items)

            await this.emptyInventoryInBank()
            let inventoryCapacity = this.me.inventory_max_items - this.getCurrentInventoryLevel()
            let amountOfCrafts = 0
            let hasBankNoMoreItem = false
            while (inventoryCapacity > 0 && !hasBankNoMoreItem) {
                //console.log('Checking inventory:', inventoryCapacity)
                craftToDo.craft.items.forEach(itemForCraft => {
                    //console.log('Checking bank for', itemForCraft)
                    inventoryCapacity -= itemForCraft.quantity
                    itemsInBank.forEach(itemInBank => {
                        if (itemForCraft.code === itemInBank.code) {
                            //console.log('   Bank has', itemInBank.quantity)
                            itemInBank.quantity -= itemForCraft.quantity
                            if (itemForCraft.quantity >= itemInBank.quantity) hasBankNoMoreItem = true
                        }
                    })
                })
                amountOfCrafts++
            }
            if (inventoryCapacity < 0) amountOfCrafts--
            console.log(`${this.me.name}: Amount of craft possible ${amountOfCrafts}`)
            for (const item of craftToDo.craft.items) {
                await this.withdrawItem(item.code, item.quantity * amountOfCrafts)
            }
            if (craftToDo.craft.skill === undefined) return
            await this.goToBuildingFor(craftToDo.craft.skill)
            console.log(`${this.me.name}: Start crafting  '${craftToDo.name}' x${amountOfCrafts}`)
            await this.craft(craftToDo.code, amountOfCrafts).catch(async (errorCode: number) => {
                switch (errorCode) {
                    case ERROR_CODE_STILL_IN_COOLDOWN:
                        console.log('2nd attempt after cooldown')
                        await this.craft(craftToDo.code, amountOfCrafts)
                        break
                    case ERROR_CODE_SLOT_EMPTY:
                        break
                    default:
                        return Promise.reject()
                }
            })
            console.log(`${this.me.name}: Crafting done`)
            await this.emptyInventoryInBank().then(resolve)
        })
    }

    fightMonster(monsterName: string, amountOfKillToDO: number = 300) {
        return new Promise<void>(async resolve => {
            console.log(`${this.me.name}: Try action fight monster ${monsterName}`)
            const mapsWhereMonsterIsPresent = await findMapsWithContent(monsterName)
            const mapToFight = await getClosestMapFromDestination(mapsWhereMonsterIsPresent, fromCoordinatesToDestination(this.me.x, this.me.y))
            const monsterToFight = (await findMonsterByName(monsterName))[0] ?? null
            if (monsterToFight === null) {
                console.error(`Could not find monster ${monsterName} in DB`)
                resolve()
                return
            }

            console.log(`${this.me.name}: Start fighting '${monsterToFight.name}' at ${mapToFight._id}`)
            await this.changeEquipementForMonster(monsterToFight)
            await this.moveTo(mapToFight.x, mapToFight.y)
            let bodyCount = 0
            while (this.getCurrentInventoryLevel() < this.me.inventory_max_items / 2 && bodyCount < amountOfKillToDO) {
                await this.fight()
                    .catch(async () => {
                        await this.handleActionErrorNotFound(mapToFight.x, mapToFight.y)
                    })
                    .then(() => {
                        bodyCount++
                    })
            }
            console.log(`${this.me.name}: Inventory full`)
            await this.emptyInventoryInBank().then(resolve)
        })
    }

    emptyInventoryInBank() {
        const itemToKeep = [
            'golden_egg',
            'golden_shrimp',
            'emerald',
            'topaz',
            'ruby',
            'sapphire',
            'iron_pickaxe',
            'gold_pickaxe',
            'iron_axe',
            'gold_axe',
            'spruce_fishing_rod',
            'gold_fishing_rod',
            'iron_sword',
            'iron_dagger',
            'fire_bow',
            'greater_wooden_staff',
            'mushstaff',
            'mushmush_bow',
        ]
        return new Promise<void>(async resolve => {
            console.log(`${this.me.name}: Start emptying inventory in bank`)
            await this.goToBuildingFor('bank')
            if (!this.me.inventory) return
            for (const item of this.me.inventory) {
                if (item.quantity > 0 && itemToKeep.indexOf(item.code) === -1)
                    await this.depositItem(item.code, item.quantity).catch(async () => {
                        await this.handleActionErrorNotFound(4, 1)
                    })
            }
            await this.depositGold().catch(async () => {
                await this.handleActionErrorNotFound(4, 1)
            })
            resolve()
        })
    }

    async changeWeaponForTool(resourceSkill: ResourceSchemaSkillEnum) {
        let bestWeapon: string | null = null
        switch (resourceSkill) {
            case 'mining':
                bestWeapon = this.hasItemInInventory('gold_pickaxe') ? 'gold_pickaxe' : this.hasItemInInventory('iron_pickaxe') ? 'iron_pickaxe' : null
                break
            case 'woodcutting':
                bestWeapon = this.hasItemInInventory('gold_axe') ? 'gold_axe' : this.hasItemInInventory('iron_axe') ? 'iron_axe' : null
                break
            case 'fishing':
                bestWeapon = this.hasItemInInventory('gold_fishing_rod') ? 'gold_fishing_rod' : this.hasItemInInventory('spruce_fishing_rod') ? 'spruce_fishing_rod' : null
                break
        }
        if (bestWeapon !== null) {
            await this.unequip('weapon')
            await this.equip(bestWeapon, 'weapon')
        }
    }

    async changeEquipementForMonster(monster: MonsterSchema) {
        await this.unequip('weapon')
        // Weapon
        const listOfAvailableWeapons: ItemSchema[] = []
        const allGameWeapons = await findItemsByType('weapon')

        // InventorySlot does not provide the item type. We don't know which slots are weapons
        // hence filtering through all games' weapons
        this.me.inventory?.forEach((slot: InventorySlot) => {
            allGameWeapons.forEach((weapon: ItemSchema) => {
                if (weapon.code === slot.code) {
                    listOfAvailableWeapons.push(weapon)
                }
            })
        })

        if (listOfAvailableWeapons.length < 1) {
            console.log(`${this.me.name}: No weapon found in inventory`, listOfAvailableWeapons)
            resolve()
            return
        }

        let bestWeapon: ItemSchema & { total_damage: number } = { ...listOfAvailableWeapons[0], total_damage: 0 }
        listOfAvailableWeapons.forEach((weapon: ItemSchema) => {
            let totalWeaponDamage = 0
            weapon.effects?.forEach((weaponEffect: ItemEffectSchema) => {
                switch (weaponEffect.name) {
                    case 'attack_fire':
                        totalWeaponDamage += weaponEffect.value * (1 - monster.res_fire / 100)
                        break
                    case 'attack_water':
                        totalWeaponDamage += weaponEffect.value * (1 - monster.res_water / 100)
                        break
                    case 'attack_earth':
                        totalWeaponDamage += weaponEffect.value * (1 - monster.res_earth / 100)
                        break
                    case 'attack_air':
                        totalWeaponDamage += weaponEffect.value * (1 - monster.res_air / 100)
                        break
                }
            })
            bestWeapon = bestWeapon.total_damage < totalWeaponDamage ? { ...weapon, total_damage: totalWeaponDamage } : bestWeapon
        })

        await this.equip(bestWeapon.code, 'weapon')
    }

    getStats() {
        return this.me
    }
}

type PossibleCraft = ItemSchema & { total_resources_to_spend: number }
