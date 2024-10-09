/* eslint-disable no-async-promise-executor */
import { CraftSchemaSkillEnum, EquipSchemaSlotEnum, InventorySlot, ItemEffectSchema, ItemSchema, MonsterSchema, ResourceSchemaSkillEnum, TaskSchemaTypeEnum } from 'artifactsmmo-sdk'
import BasePlayer from './Actions'
import { findMapsWithContent, getClosestMapFromDestination } from './Maps'
import { findResourceBySkill } from './Resources'
import { equipementFromSlotToType, fromCoordinatesToDestination, getItemEffectByName, getLowestTenOfLevel } from './Utils'
import { findItemsBySkill, findItemsByType, getItemsInBank } from './Items'
import { findMonsterByName } from './Monsters'
import { ERROR_CODE_MISSING_ITEM, ItemEffectEnum, ItemTypeEnum } from './Const'

export default class Player extends BasePlayer {
    gatherResource(resourceSkill: ResourceSchemaSkillEnum, resourceLevel: number = -1): Promise<void> {
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
                await this.gather().catch(reason => {
                    this.handleActionErrors(reason, async () => await this.handleActionErrorNotFound(mapToGatherResource.x, mapToGatherResource.y))
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

            await this.emptyInventoryInBank().then(async () => await this.goToBuildingFor('bank'))
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
                await this.withdrawItem(item.code, item.quantity * amountOfCrafts).catch(async reason => {
                    if (reason === ERROR_CODE_MISSING_ITEM) {
                        console.log('Item missing in Bank. Cancel craft action')
                        await this.emptyInventoryInBank().then(resolve)
                    }
                    this.handleActionErrors(reason, async () => await this.craft(craftToDo.code, amountOfCrafts))
                })
            }
            if (craftToDo.craft.skill === undefined) return
            await this.goToBuildingFor(craftToDo.craft.skill)
            console.log(`${this.me.name}: Start crafting  '${craftToDo.name}' x${amountOfCrafts}`)
            await this.craft(craftToDo.code, amountOfCrafts).catch(reason => {
                this.handleActionErrors(reason, async () => await this.craft(craftToDo.code, amountOfCrafts))
            })
            await this.recycle(craftToDo.code, amountOfCrafts).catch(reason => {
                this.handleActionErrors(reason, async () => await this.recycle(craftToDo.code, amountOfCrafts))
            })

            console.log(`${this.me.name}: Crafting done`)
            await this.emptyInventoryInBank().then(resolve)
        })
    }

    fightMonster(monsterName: string, amountOfKillToDo: number = 300): Promise<void> {
        return new Promise<void>(async resolve => {
            console.log(`${this.me.name}: Try action fight monster ${monsterName}`)
            const mapsWhereMonsterIsPresent = await findMapsWithContent(monsterName)
            const mapToFight = await getClosestMapFromDestination(mapsWhereMonsterIsPresent, fromCoordinatesToDestination(this.me.x, this.me.y))

            const monsterToFight = (await findMonsterByName(monsterName))[0] ?? null
            if (monsterToFight === null) {
                console.error(`Could not find monster ${monsterName} in DB`)
                return resolve()
            }

            console.log(`${this.me.name}: Start fighting '${monsterToFight.name}' at ${mapToFight._id}`)
            await this.emptyInventoryInBank()
            await this.changeEquipementForMonster(monsterToFight)
            await this.moveTo(mapToFight.x, mapToFight.y)

            let bodyCount = 0
            while (this.getCurrentInventoryLevel() < this.me.inventory_max_items && bodyCount < amountOfKillToDo) {
                await this.fight()
                    .then(() => {
                        bodyCount++
                    })
                    .catch(reason => {
                        bodyCount--
                        this.handleActionErrors(reason, async () => await this.handleActionErrorNotFound(mapToFight.x, mapToFight.y))
                    })
            }
            if (bodyCount === amountOfKillToDo) console.log(`${this.me.name}: Amount of kill reached`)
            else console.log(`${this.me.name}: Inventory full`)
            return await this.emptyInventoryInBank().then(async () => {
                if (bodyCount < amountOfKillToDo) {
                    console.log(`Still need to fight ${amountOfKillToDo - bodyCount} ${monsterName}`)
                    return await this.fightMonster(monsterName, amountOfKillToDo - bodyCount)
                } else resolve()
            })
        })
    }

    completeMonsterTask(taskType: TaskSchemaTypeEnum): Promise<void> {
        return new Promise<void>(async resolve => {
            console.log(`${this.me.name}: Start to work on task '${taskType}'`)

            let currentTask = this.getCurrentTask()
            if (currentTask === null) {
                // get a new one
                await this.goToBuildingFor(taskType)
                await this.acceptNewTask().catch(reason => {
                    this.handleActionErrors(reason, async () => this.goToBuildingFor(taskType))
                })
                currentTask = this.getCurrentTask()
            }

            if (currentTask === null) {
                console.error(`Couldn't get a new task of type ${taskType}`)
                return resolve()
            }

            const monsterToFight = (await findMonsterByName(currentTask.code))[0] ?? null
            if (monsterToFight === null) {
                console.error(`Could not find monster ${currentTask.code} in DB`)
                return resolve()
            }

            if (monsterToFight.level >= 20) {
                console.log(`Monster ${monsterToFight.name} is too strong. Cancel task`)
                await this.cancelCurrentTask().catch(reason => {
                    this.handleActionErrors(reason, async () => await this.cancelCurrentTask())
                })
                return resolve()
            }

            // TODO task "items"
            //if (currentTask.type === TaskSchemaTypeEnum.Items)
            if (currentTask.type === TaskSchemaTypeEnum.Monsters) {
                const killToDo = currentTask.total - this.me.task_progress
                if (killToDo > 0) await this.fightMonster(monsterToFight.code, killToDo)
                else console.log('Task already completed', killToDo)
            }

            await this.goToBuildingFor(taskType)
            await this.completeCurrentTask().catch(reason => {
                return this.handleActionErrors(reason, async () => await this.completeCurrentTask())
            })

            resolve()
        })
    }

    emptyInventoryInBank() {
        const itemToKeep = [
            // Tools
            'iron_pickaxe',
            'gold_pickaxe',
            'iron_axe',
            'gold_axe',
            'spruce_fishing_rod',
            'gold_fishing_rod',
            // Gears
            'steel_shield',
            'skeleton_pants',
            'skeleton_helmet',
            'skeleton_armor',
            'steel_helm',
            'steel_armor',
            'steel_legs_armor',
            'tromatising_mask',
            'serpent_skin_armor',
            'serpent_skin_legs_armor',
            'magic_wizard_hat',
            'fire_and_earth_amulet',
            'air_and_water_amulet',
            'iron_ring',
            // Weapons
            'skull_staff',
            'forest_whip',
            'battlestaff',
            'steel_battleaxe',
            // Exceptions
            'jasper_crystal',
            'tasks_coin',
        ]
        return new Promise<void>(async resolve => {
            console.log(`${this.me.name}: Start emptying inventory in bank`)
            if (!this.me.inventory) return

            let hasAtLeastOneItemToDeposit = false
            for (const item of this.me.inventory) {
                if (item.quantity > 0 && itemToKeep.indexOf(item.code) === -1) hasAtLeastOneItemToDeposit = true
            }

            if (!hasAtLeastOneItemToDeposit) {
                console.log('Nothing to deposit in bank')
                return resolve()
            }

            await this.goToBuildingFor('bank')
            for (const item of this.me.inventory) {
                if (item.quantity > 0 && itemToKeep.indexOf(item.code) === -1) {
                    await this.depositItem(item.code, item.quantity).catch(reason => {
                        this.handleActionErrors(reason, async () => await this.handleActionErrorNotFound(4, 1))
                    })
                }
            }
            await this.depositGold().catch(reason => {
                this.handleActionErrors(reason, async () => await this.handleActionErrorNotFound(4, 1))
            })
            return resolve()
        })
    }

    async changeWeaponForTool(resourceSkill: ResourceSchemaSkillEnum) {
        let bestWeapon: string | null = null
        switch (resourceSkill) {
            case ResourceSchemaSkillEnum.Mining:
                bestWeapon = this.hasItemInInventory('gold_pickaxe') ? 'gold_pickaxe' : this.hasItemInInventory('iron_pickaxe') ? 'iron_pickaxe' : null
                break
            case ResourceSchemaSkillEnum.Woodcutting:
                bestWeapon = this.hasItemInInventory('gold_axe') ? 'gold_axe' : this.hasItemInInventory('iron_axe') ? 'iron_axe' : null
                break
            case ResourceSchemaSkillEnum.Fishing:
                bestWeapon = this.hasItemInInventory('gold_fishing_rod') ? 'gold_fishing_rod' : this.hasItemInInventory('spruce_fishing_rod') ? 'spruce_fishing_rod' : null
                break
        }
        if (bestWeapon !== null) {
            await this.unequip(EquipSchemaSlotEnum.Weapon)
            await this.equip(bestWeapon, EquipSchemaSlotEnum.Weapon)
        }
    }

    async changeEquipementForMonster(monster: MonsterSchema) {
        let bestWeapon: ItemSchema | null = null
        for (const unequipSchemaSlot of Object.entries<ItemTypeEnum>(ItemTypeEnum)) {
            const equipementSlotType: ItemTypeEnum = unequipSchemaSlot[1]
            console.log(`Searching best ${equipementSlotType}`)

            const equipementType = equipementFromSlotToType(equipementSlotType)
            const allGearOfThatType = await findItemsByType(equipementType)

            let hasAtLeastOneItemInIventory = false
            this.me.inventory?.forEach((slot: InventorySlot) => {
                allGearOfThatType.forEach((gear: ItemSchema) => {
                    if (gear.code === slot.code) {
                        hasAtLeastOneItemInIventory = true
                    }
                })
            })

            if (!hasAtLeastOneItemInIventory) {
                console.log(`Do not have any ${equipementType} in inventory`)
                continue
            }

            await this.unequip(equipementSlotType).catch(reason => {
                this.handleActionErrors(reason, async () => this.unequip(equipementSlotType))
            })

            const listOfAvailableGears: ItemSchema[] = []
            this.me.inventory?.forEach((slot: InventorySlot) => {
                allGearOfThatType.forEach((gear: ItemSchema) => {
                    if (gear.code === slot.code) {
                        listOfAvailableGears.push(gear)
                    }
                })
            })

            if (listOfAvailableGears.length < 1) {
                console.log(`${this.me.name}: No ${equipementType} found in inventory`, listOfAvailableGears)
                continue
            }

            let bestGear: ItemSchema & { total_points: number } = { ...listOfAvailableGears[0], total_points: 0 }
            listOfAvailableGears.forEach((gear: ItemSchema) => {
                let totalPoints = 0
                gear.effects?.forEach((gearEffect: ItemEffectSchema) => {
                    switch (gearEffect.name) {
                        // Attack
                        case ItemEffectEnum.Attack_Fire:
                            totalPoints += gearEffect.value * (1 - monster.res_fire / 100)
                            break
                        case ItemEffectEnum.Attack_Water:
                            totalPoints += gearEffect.value * (1 - monster.res_water / 100)
                            break
                        case ItemEffectEnum.Attack_Earth:
                            totalPoints += gearEffect.value * (1 - monster.res_earth / 100)
                            break
                        case ItemEffectEnum.Attack_Air:
                            totalPoints += gearEffect.value * (1 - monster.res_air / 100)
                            break
                        // Damages
                        case ItemEffectEnum.Damage_Fire:
                            totalPoints +=
                                (1 + gearEffect.value / 100) * (bestWeapon !== null ? (getItemEffectByName(bestWeapon, ItemEffectEnum.Attack_Fire)?.value ?? 0) : 0) * (1 - monster.res_fire / 100)
                            break
                        case ItemEffectEnum.Damage_Water:
                            totalPoints +=
                                (1 + gearEffect.value / 100) * (bestWeapon !== null ? (getItemEffectByName(bestWeapon, ItemEffectEnum.Attack_Water)?.value ?? 0) : 0) * (1 - monster.res_water / 100)
                            break
                        case ItemEffectEnum.Damage_Earth:
                            totalPoints +=
                                (1 + gearEffect.value / 100) * (bestWeapon !== null ? (getItemEffectByName(bestWeapon, ItemEffectEnum.Attack_Earth)?.value ?? 0) : 0) * (1 - monster.res_earth / 100)
                            break
                        case ItemEffectEnum.Damage_Air:
                            totalPoints +=
                                (1 + gearEffect.value / 100) * (bestWeapon !== null ? (getItemEffectByName(bestWeapon, ItemEffectEnum.Attack_Air)?.value ?? 0) : 0) * (1 - monster.res_air / 100)
                            break
                        // Resistances
                        case ItemEffectEnum.Resistance_Fire:
                            totalPoints += monster.attack_fire * (1 + gearEffect.value / 100)
                            break
                        case ItemEffectEnum.Resistance_Water:
                            totalPoints += monster.attack_water * (1 + gearEffect.value / 100)
                            break
                        case ItemEffectEnum.Resistance_Earth:
                            totalPoints += monster.attack_earth * (1 + gearEffect.value / 100)
                            break
                        case ItemEffectEnum.Resistance_Air:
                            totalPoints += monster.attack_air * (1 + gearEffect.value / 100)
                            break
                        // Miscellaneous
                        case ItemEffectEnum.Hit_Point:
                        case ItemEffectEnum.Haste:
                            totalPoints += gearEffect.value / 2
                            break
                        case ItemEffectEnum.Woodcutting:
                        case ItemEffectEnum.Mining:
                        case ItemEffectEnum.Fishing:
                            break
                        default:
                            console.error(`Could not identify gear effect '${gearEffect.name}' from gear ${gear.name}`, gear)
                    }
                })
                bestGear = bestGear.total_points < totalPoints ? { ...gear, total_points: totalPoints } : bestGear
                if (bestGear.type === ItemTypeEnum.Weapon) bestWeapon = bestGear
            })
            await this.equip(bestGear.code, equipementSlotType)
        }
    }
}

type PossibleCraft = ItemSchema & { total_resources_to_spend: number }
