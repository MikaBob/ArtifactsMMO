/* eslint-disable no-async-promise-executor */
import { CraftSchemaSkillEnum, ItemSchema, ResourceSchemaSkillEnum } from 'artifactsmmo-sdk'
import BasePlayer from './Actions'
import { findMapsWithContent, getClosestMapFromDestination } from './Maps'
import { findItemsBySkill, findResourceBySkill, getItemsInBank } from './Resources'
import { fromCoordinatesToDestination, getLowestTenOfLevel } from './Utils'

export default class Player extends BasePlayer {
    gatherResource(resourceSkill: ResourceSchemaSkillEnum, resourceLevel: number = -1) {
        return new Promise<void>(async resolve => {
            if (resourceLevel < 0) resourceLevel = getLowestTenOfLevel(this.getMyLevelOfSkill(resourceSkill))
            console.log(`${this.me.name}: Try action gather resource ${resourceSkill} of level ${resourceLevel}`)
            const resourceToGather = await findResourceBySkill(resourceSkill, resourceLevel)
            const mapsWhereResourceIsPresent = await findMapsWithContent(resourceToGather.code)
            const mapToGatherResource = await getClosestMapFromDestination(mapsWhereResourceIsPresent, fromCoordinatesToDestination(this.me.x, this.me.y))
            console.log(`${this.me.name}: Start gathering resource '${resourceToGather.name}' at ${mapToGatherResource._id}`)

            await this.moveTo(mapToGatherResource.x, mapToGatherResource.y)
            while (this.getCurrentInventoryLevel() < this.me.inventory_max_items) {
                await this.gather()
            }
            console.log(`${this.me.name}: Inventory full`)
            await Promise.allSettled([this.emptyInventoryInBank()])
            resolve()
        })
    }

    craftItems(craftSkill: CraftSchemaSkillEnum, craftLevel: number = -1): Promise<void> {
        return new Promise<void>(async resolve => {
            if (craftLevel < 0) craftLevel = this.getMyLevelOfSkill(craftSkill)
            const minCraftLevel = getLowestTenOfLevel(craftLevel)
            console.log(`${this.me.name}: Try action craft item ${craftSkill}, from ${minCraftLevel} to ${craftLevel}`)
            const possibleCrafts = await findItemsBySkill(craftSkill, minCraftLevel, craftLevel)
            const itemsInBank = await getItemsInBank()

            let craftToDo: ItemSchema | undefined
            possibleCrafts.forEach(possibleCraft => {
                let isPossibleToCraft = true
                if (possibleCraft.craft === undefined || possibleCraft.craft === null || possibleCraft.craft.items === undefined) return
                possibleCraft.craft.items.forEach(itemRequiredForCraft => {
                    let itemsPresentInBank = false
                    itemsInBank.forEach(itemInBank => {
                        if (itemRequiredForCraft.code === itemInBank.code && itemRequiredForCraft.quantity <= itemInBank.quantity) itemsPresentInBank = true
                    })
                    if (!itemsPresentInBank) isPossibleToCraft = false
                })
                if (isPossibleToCraft) craftToDo = possibleCraft
            })

            if (craftToDo === undefined || craftToDo.craft === undefined || craftToDo.craft === null || craftToDo.craft.items === undefined) {
                console.log(`${this.me.name}: No possible craft found among`, possibleCrafts)
                resolve()
                return
            }
            console.log(`${this.me.name}: Possible craft found`, craftToDo, craftToDo.craft.items)

            await Promise.allSettled([this.emptyInventoryInBank()])
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
            await this.craft(craftToDo.code, amountOfCrafts)
            console.log(`${this.me.name}: Crafting done`)
            await Promise.allSettled([this.emptyInventoryInBank()])
            resolve()
        })
    }

    fightMonster(monsterName: string) {
        return new Promise<void>(async resolve => {
            console.log(`${this.me.name}: Try action fight monster ${monsterName}`)
            const mapsWhereMonsterIsPresent = await findMapsWithContent(monsterName)
            const mapToFight = await getClosestMapFromDestination(mapsWhereMonsterIsPresent, fromCoordinatesToDestination(this.me.x, this.me.y))
            console.log(`${this.me.name}: Start fighting '${monsterName}' at ${mapToFight._id}`)

            await this.moveTo(mapToFight.x, mapToFight.y)
            while (this.getCurrentInventoryLevel() < this.me.inventory_max_items) {
                await this.fight()
            }
            console.log(`${this.me.name}: Inventory full`)
            await Promise.allSettled([this.emptyInventoryInBank()])
            resolve()
        })
    }

    emptyInventoryInBank() {
        const itemToKeep = ['golden_egg', 'golden_shrimp', 'emerald', 'topaz', 'ruby', 'sapphire', 'tasks_coin', 'iron_pickaxe', 'iron_axe', 'iron_sword', 'iron_dagger', 'fire_bow']
        return new Promise<void>(async resolve => {
            console.log(`${this.me.name}: Start emptying inventory in bank`)
            await this.goToBuildingFor('bank')
            if (!this.me.inventory) return
            for (const item of this.me.inventory) {
                if (item.quantity > 0 && itemToKeep.indexOf(item.code) === -1) await this.depositItem(item.code, item.quantity)
            }
            await this.depositGold()
            resolve()
        })
    }

    getStats() {
        return this.me
    }
}
