import {
    BankItemTransactionSchema,
    CharacterFightDataSchema,
    CharacterMovementDataSchema,
    CharacterSchema,
    CraftingSchema,
    GetAllTasksTasksListGetSkillEnum as SkillEnum,
    SimpleItemSchema,
    SkillDataSchema,
} from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'
import { fromCoordinatesToDestination, waitForCooldown } from './Utils'

const apiClient = getApiCLient()

export default class BasePlayer {
    protected me: CharacterSchema

    constructor(character: CharacterSchema) {
        this.me = character
    }

    // Actions
    goToForge() {
        return this.moveTo(1, 5)
    }
    goToWoodcutting() {
        return this.moveTo(-2, -3)
    }
    goToCopperRocks() {
        return this.moveTo(2, 0)
    }
    goToWeaponCrafting() {
        return this.moveTo(2, 1)
    }
    goToGearCrafting() {
        return this.moveTo(3, 1)
    }
    goToJewelryCrafting() {
        return this.moveTo(1, 3)
    }
    goToBank() {
        return this.moveTo(4, 1)
    }

    // API calls
    async depositItem(itemName: string, quantity: number): Promise<void> {
        console.log(`Deposit ${quantity} ${itemName} to bank`)
        const depositSchema: SimpleItemSchema = { code: itemName, quantity: quantity }
        return await this.actionCallback((await apiClient.myCharacters.actionDepositBankMyNameActionBankDepositPost(this.me.name, depositSchema)).data.data)
    }
    async withdrawItem(itemName: string, quantity: number): Promise<void> {
        console.log(`Withdraw ${quantity} ${itemName} from bank`)
        const withdrawSchema: SimpleItemSchema = { code: itemName, quantity: quantity }
        return await this.actionCallback((await apiClient.myCharacters.actionWithdrawBankMyNameActionBankWithdrawPost(this.me.name, withdrawSchema)).data.data)
    }
    async fight(): Promise<void> {
        console.log(`Fight`)
        return await this.actionCallback((await apiClient.myCharacters.actionFightMyNameActionFightPost(this.me.name)).data.data)
    }
    async gather(): Promise<void> {
        console.log(`Gather`)
        return await this.actionCallback((await apiClient.myCharacters.actionGatheringMyNameActionGatheringPost(this.me.name)).data.data)
    }
    async craft(objectToCraft: string, quantity: number = 1): Promise<void> {
        const crafting: CraftingSchema = { code: objectToCraft, quantity: quantity }
        console.log(`Craft ${objectToCraft} x${quantity}`)
        return await this.actionCallback((await apiClient.myCharacters.actionCraftingMyNameActionCraftingPost(this.me.name, crafting)).data.data)
    }
    async moveTo(x: number, y: number): Promise<void> {
        if (this.me.x === x && this.me.y === y) {
            console.log(`Character is already at ${x}.${y}`)
            return new Promise(resolve => setTimeout(resolve, 1))
        }
        console.log(`Moving to ${x}.${y}`)
        return await this.actionCallback((await apiClient.myCharacters.actionMoveMyNameActionMovePost(this.me.name, fromCoordinatesToDestination(x, y))).data.data)
    }

    // Utils
    updateCharacter(updatedCharacter: CharacterSchema): void {
        if (this.me.name === updatedCharacter.name) this.me = updatedCharacter
    }
    async actionCallback(data: CharacterMovementDataSchema | CharacterFightDataSchema | SkillDataSchema | BankItemTransactionSchema): Promise<void> {
        if (data !== undefined) {
            this.updateCharacter(data.character)
            return waitForCooldown(data.cooldown)
        }
        const now = Date.now()
        return waitForCooldown({
            reason: 'unequip',
            remaining_seconds: 5,
            total_seconds: 5,
            started_at: new Date(now).toISOString(),
            expiration: new Date(now + 5000).toISOString(),
        })
    }

    isInventoryFull(): boolean {
        if (!this.me.inventory) return false
        return this.me.inventory.reduce((acc, current) => acc + current.quantity, 0) >= this.me.inventory_max_items
    }

    getMyLevelOfSkill(skill: SkillEnum): number {
        switch (skill) {
            case 'mining':
                return this.me.mining_level
            case 'woodcutting':
                return this.me.woodcutting_level
            case 'fishing':
                return this.me.fishing_level
            case 'weaponcrafting':
                return this.me.weaponcrafting_level
            case 'gearcrafting':
                return this.me.gearcrafting_level
            case 'jewelrycrafting':
                return this.me.jewelrycrafting_level
            case 'cooking':
                return this.me.cooking_level
            default:
                return 1
        }
    }
}
