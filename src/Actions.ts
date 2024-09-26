import { CraftingSchema } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'
import { fromCoordinatesToDestination } from './Utils'

const apiClient = getApiCLient()

const MoveTo = async (name: string, x: number, y: number) => {
    console.log(`Moving to ${x}.${y}`)
    return (await apiClient.myCharacters.actionMoveMyNameActionMovePost(name, fromCoordinatesToDestination(x, y))).data.data
}

export const GoToForge = (name: string) => {
    return MoveTo(name, 1, 5)
}

export const GoToCopperRocks = (name: string) => {
    return MoveTo(name, 2, 0)
}

export const GoToWeaponCrafting = (name: string) => {
    return MoveTo(name, 2, 1)
}

export const GoToGearCrafting = (name: string) => {
    return MoveTo(name, 3, 1)
}

export const GoToJewelryCrafting = (name: string) => {
    return MoveTo(name, 1, 3)
}

export const Fight = async (name: string) => {
    return (await apiClient.myCharacters.actionFightMyNameActionFightPost(name)).data.data
}

export const Gather = async (name: string) => {
    return (await apiClient.myCharacters.actionGatheringMyNameActionGatheringPost(name)).data.data
}

export const Craft = async (name: string, objectToCraft: string, quantity: number = 1) => {
    const crafting: CraftingSchema = { code: objectToCraft, quantity: quantity }
    return (await apiClient.myCharacters.actionCraftingMyNameActionCraftingPost(name, crafting)).data.data
}
