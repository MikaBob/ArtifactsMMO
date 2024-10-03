import {
    CharacterSchema,
    CraftingSchema,
    GetAllTasksTasksListGetSkillEnum as SkillEnum,
    SimpleItemSchema,
    DepositWithdrawGoldSchema,
    CharacterMovementResponseSchema,
    CharacterFightResponseSchema,
    SkillResponseSchema,
    BankItemTransactionResponseSchema,
    BankGoldTransactionResponseSchema,
} from 'artifactsmmo-sdk'
import { APIErrorType, getApiCLient } from './ApiClient'
import { fromCoordinatesToDestination, waitForCooldown } from './Utils'
import { findMapsWithContent, getClosestMapFromDestination } from './Maps'
import { ERROR_CODE_STILL_IN_COOLDOWN } from './Const'

const apiClient = getApiCLient()

type ActionCallbackResponse = Promise<void | number>

export default class BasePlayer {
    protected me: CharacterSchema

    constructor(character: CharacterSchema) {
        this.me = character
        console.log(`${this.me.name} joined the game`)
    }

    async goToBuildingFor(skill: SkillEnum | 'bank' | 'monsters' | 'items' | 'grand_exchange') {
        if (skill === 'fishing') skill = 'cooking'
        const mapsWithWorkshop = await findMapsWithContent(skill)
        const mapToGoTo = await getClosestMapFromDestination(mapsWithWorkshop, fromCoordinatesToDestination(this.me.x, this.me.y))
        return await this.moveTo(mapToGoTo.x, mapToGoTo.y)
    }

    // API calls
    async depositItem(itemName: string, quantity: number): ActionCallbackResponse {
        console.log(`${this.me.name}: Deposit ${quantity} ${itemName} to bank`)
        const depositSchema: SimpleItemSchema = { code: itemName, quantity: quantity }
        return await this.actionCallback((await apiClient.myCharacters.actionDepositBankMyNameActionBankDepositPost(this.me.name, depositSchema)).data)
    }
    async withdrawItem(itemName: string, quantity: number): ActionCallbackResponse {
        console.log(`${this.me.name}: Withdraw ${quantity} ${itemName} from bank`)
        const withdrawSchema: SimpleItemSchema = { code: itemName, quantity: quantity }
        return await this.actionCallback((await apiClient.myCharacters.actionWithdrawBankMyNameActionBankWithdrawPost(this.me.name, withdrawSchema)).data)
    }
    async depositGold(amountOfGold: number = -1): ActionCallbackResponse {
        const toDeposit = amountOfGold < 0 ? this.me.gold : amountOfGold
        if (toDeposit > 0) {
            console.log(`${this.me.name}: Deposit ${toDeposit} gold to bank`)
            const depositSchema: DepositWithdrawGoldSchema = { quantity: toDeposit }
            return await this.actionCallback((await apiClient.myCharacters.actionDepositBankGoldMyNameActionBankDepositGoldPost(this.me.name, depositSchema)).data)
        }
    }
    async withdrawGold(amountOfGold: number = -1): ActionCallbackResponse {
        const toWithdraw = amountOfGold < 0 ? this.me.gold : amountOfGold
        if (toWithdraw > 0) {
            console.log(`${this.me.name}: Withdraw ${toWithdraw} gold to bank`)
            const withdrawSchema: DepositWithdrawGoldSchema = { quantity: toWithdraw }
            return await this.actionCallback((await apiClient.myCharacters.actionWithdrawBankGoldMyNameActionBankWithdrawGoldPost(this.me.name, withdrawSchema)).data)
        }
    }
    async fight(): ActionCallbackResponse {
        console.log(`${this.me.name}: Fight`)
        if (this.me.name === 'Chief' && this.me.level >= 10) {
            throw new Error(`${this.me.name} should not fight anymore`)
        }
        return await this.actionCallback((await apiClient.myCharacters.actionFightMyNameActionFightPost(this.me.name)).data)
    }
    async gather(): ActionCallbackResponse {
        console.log(`${this.me.name}: Gather`)
        return await this.actionCallback((await apiClient.myCharacters.actionGatheringMyNameActionGatheringPost(this.me.name)).data)
    }
    async craft(objectToCraft: string, quantity: number = 1): ActionCallbackResponse {
        const crafting: CraftingSchema = { code: objectToCraft, quantity: quantity }
        console.log(`${this.me.name}: Craft ${objectToCraft} x${quantity}`)
        return await this.actionCallback((await apiClient.myCharacters.actionCraftingMyNameActionCraftingPost(this.me.name, crafting)).data)
    }
    async moveTo(x: number, y: number): ActionCallbackResponse {
        if (this.me.x === x && this.me.y === y) {
            console.log(`${this.me.name}: Character is already at ${x}.${y}`)
            return new Promise(resolve => setTimeout(resolve, 1000))
        }

        console.log(`${this.me.name}: Moving to ${x}.${y}`)
        return await this.actionCallback((await apiClient.myCharacters.actionMoveMyNameActionMovePost(this.me.name, fromCoordinatesToDestination(x, y))).data).catch(async (errorCode: number) => {
            switch (errorCode) {
                case ERROR_CODE_STILL_IN_COOLDOWN:
                    console.log('2nd attempt after cooldown')
                    await this.moveTo(x, y)
                    break
            }
        })
    }

    // Utils
    updateCharacter(updatedCharacter: CharacterSchema): void {
        if (this.me.name === updatedCharacter.name) this.me = updatedCharacter
    }

    async actionCallback(
        actionResponse: CharacterMovementResponseSchema | CharacterFightResponseSchema | SkillResponseSchema | BankItemTransactionResponseSchema | BankGoldTransactionResponseSchema | APIErrorType,
    ): ActionCallbackResponse {
        if (actionResponse.data !== undefined) {
            this.updateCharacter(actionResponse.data.character)
            return waitForCooldown(actionResponse.data.cooldown)
        }
        return Promise.reject<number>(actionResponse.code)
    }

    async handleActionErrorNotFound(x: number, y: number) {
        return await this.moveTo(x, y)
    }

    getCurrentInventoryLevel(): number {
        if (!this.me.inventory) return 0
        return this.me.inventory.reduce((acc, current) => acc + current.quantity, 0)
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
