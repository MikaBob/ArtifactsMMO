import { CharacterFightDataSchema, CharacterMovementDataSchema, CraftingSchema, SkillDataSchema } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'
import { getMainCharacter, updateCharacter } from './Character'
import { fromCoordinatesToDestination, waitForCooldown } from './Utils'

const apiClient = getApiCLient()

const postActionProcess = (data: CharacterMovementDataSchema | CharacterFightDataSchema | SkillDataSchema): Promise<void> => {
    updateCharacter(data.character)
    return waitForCooldown(data.cooldown)
}

const MoveTo = async (x: number, y: number): Promise<void> => {
    const mainCharater = await getMainCharacter()
    console.log(`Moving to ${x}.${y}`)
    return postActionProcess((await apiClient.myCharacters.actionMoveMyNameActionMovePost(mainCharater.name, fromCoordinatesToDestination(x, y))).data.data)
}

export const MoveRelatively = async (alongX: number, alongY: number): Promise<void> => {
    const mainCharater = await getMainCharacter()
    MoveTo(mainCharater.x + alongX, mainCharater.y + alongY)
}

export const GoToForge = (): Promise<void> => {
    return MoveTo(1, 5)
}

export const GoToCopperRocks = (): Promise<void> => {
    return MoveTo(2, 0)
}

export const GoToWeaponCrafting = (): Promise<void> => {
    return MoveTo(2, 1)
}

export const GoToGearCrafting = (): Promise<void> => {
    return MoveTo(3, 1)
}

export const GoToJewelryCrafting = (): Promise<void> => {
    return MoveTo(1, 3)
}

export const Fight = async (): Promise<void> => {
    const mainCharater = await getMainCharacter()
    console.log(`Start fighting on ${mainCharater.x}.${mainCharater.y}`)
    return postActionProcess((await apiClient.myCharacters.actionFightMyNameActionFightPost(mainCharater.name)).data.data)
}

export const Gather = async (): Promise<void> => {
    const mainCharater = await getMainCharacter()
    console.log(`Start gathering on ${mainCharater.x}.${mainCharater.y}`)
    return postActionProcess((await apiClient.myCharacters.actionGatheringMyNameActionGatheringPost(mainCharater.name)).data.data)
}

export const Craft = async (objectToCraft: string, quantity: number = 1): Promise<void> => {
    const mainCharater = await getMainCharacter()
    console.log(`Start crafting ${objectToCraft} x${quantity}`)
    const crafting: CraftingSchema = { code: objectToCraft, quantity: quantity }
    return postActionProcess((await apiClient.myCharacters.actionCraftingMyNameActionCraftingPost(mainCharater.name, crafting)).data.data)
}
