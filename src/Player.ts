/* eslint-disable no-async-promise-executor */
import { ResourceSchemaSkillEnum } from 'artifactsmmo-sdk'
import BasePlayer from './Actions'
import { findMapsWithContent, getClosestMapFromDestination } from './Maps'
import { findResourceBySkill } from './Resources'
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
