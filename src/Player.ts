/* eslint-disable no-async-promise-executor */
import { CraftSchemaSkillEnum, ItemSchema, ResourceSchemaSkillEnum } from 'artifactsmmo-sdk'
import BasePlayer from './Actions'
import { findMapsWithContent, getClosestMapFromDestination } from './Maps'
import { findItemsBySkill, findResourceBySkill, getItemsInBank } from './Resources'
import { fromCoordinatesToDestination, getLowestTenOfLevel } from './Utils'

export default class Player extends BasePlayer {
    gatherResource(resourceSkill: ResourceSchemaSkillEnum, resourceLevel: number = -1) {
        if (resourceLevel < 0) resourceLevel = getLowestTenOfLevel(this.getMyLevelOfSkill(resourceSkill))
        return new Promise<void>(async resolve => {
            const resourceToGather = await findResourceBySkill(resourceSkill, resourceLevel)
            const mapsWhereResourceIsPresent = await findMapsWithContent(resourceToGather.code)
            const mapToGatherResource = await getClosestMapFromDestination(mapsWhereResourceIsPresent, fromCoordinatesToDestination(this.me.x, this.me.y))
            console.log(`${this.me.name} start gathering resource '${resourceToGather.name}' at ${mapToGatherResource._id}`)

            await this.moveTo(mapToGatherResource.x, mapToGatherResource.y)
            while (!this.isInventoryFull()) {
                await this.gather()
            }
            console.log('Inventory full')
            await Promise.allSettled([this.emptyInventoryInBank()])
            resolve()
        })
    }

    craftItem(craftSkill: CraftSchemaSkillEnum, craftLevel: number = -1) {
        if (craftLevel < 0) craftLevel = getLowestTenOfLevel(this.getMyLevelOfSkill(craftSkill))
        return new Promise<void>(async resolve => {
            const possibleCrafts = await findItemsBySkill(craftSkill, craftLevel)
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
                console.log('No possible craft found among', possibleCrafts)
                return
            }
            console.log('Possible craft found', craftToDo, craftToDo.craft.items)

            await Promise.allSettled([this.emptyInventoryInBank()])
            let inventoryCapacity = this.me.inventory_max_items
            let amountOfCrafts = 0
            let hasBankNoMoreItem = false
            while (inventoryCapacity > 0 && !hasBankNoMoreItem) {
                console.log('Checking inventory:', inventoryCapacity)
                craftToDo.craft.items.forEach(itemForCraft => {
                    console.log('Checking bank for', itemForCraft)
                    inventoryCapacity -= itemForCraft.quantity
                    itemsInBank.forEach(itemInBank => {
                        if (itemForCraft.code === itemInBank.code) {
                            console.log('   Bank has', itemInBank.quantity)
                            itemInBank.quantity -= itemForCraft.quantity
                            if (itemForCraft.quantity >= itemInBank.quantity) hasBankNoMoreItem = true
                        }
                    })
                })
                amountOfCrafts++
            }
            if (inventoryCapacity < 0) amountOfCrafts--
            console.log(`Amount of craft possible ${amountOfCrafts}`)
            for (const item of craftToDo.craft.items) {
                await this.withdrawItem(item.code, item.quantity * amountOfCrafts)
            }
            if (craftToDo.craft.skill === undefined) return
            const mapsWhereToCraftItem = await findMapsWithContent(craftToDo.craft.skill)
            const mapToCraftResource = await getClosestMapFromDestination(mapsWhereToCraftItem, fromCoordinatesToDestination(this.me.x, this.me.y))
            console.log(`${this.me.name} start crafting  '${craftToDo.name}' x${amountOfCrafts} at ${mapToCraftResource._id}`)

            await this.moveTo(mapToCraftResource.x, mapToCraftResource.y)
            await this.craft(craftToDo.code, amountOfCrafts)
            console.log('Crafting done')
            await Promise.allSettled([this.emptyInventoryInBank()])
            resolve()
        })
    }

    loopToGetCopperBars(desiredAmount: number) {
        return new Promise<void>(async resolve => {
            for (let i = 1; i < desiredAmount + 1; i++) {
                await this.goToCopperRocks()
                for (let j = 0; j < 8; j++) {
                    await this.gather()
                    console.log(`Copper ore gathered: ${j}/8`)
                }
                await this.goToForge()
                await this.craft('copper')
                console.log(`Copper bar crafted: ${i}/${desiredAmount}`)
                await this.goToBank()
                await this.depositItem('copper', 1)
            }
            resolve()
        })
    }

    emptyInventoryInBank() {
        return new Promise<void>(async resolve => {
            console.log('Start emptying inventory in bank')
            await this.goToBank()
            if (!this.me.inventory) return
            for (const item of this.me.inventory) {
                if (item.quantity > 0) await this.depositItem(item.code, item.quantity)
            }
            resolve()
        })
    }

    getStats() {
        return this.me
    }
}
