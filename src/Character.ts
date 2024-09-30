import { CharacterSchema, CraftSchemaSkillEnum, ResourceSchemaSkillEnum } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'

export const PLAYER_ONE = 'Swidz'
export const PLAYER_TWO = 'Nolie'
export const PLAYER_THREE = 'Blargh'
export const PLAYER_FOUR = 'Niebieska'
export const PLAYER_FIVE = 'Chief'
export const CHARACTERS_NAME = ['', PLAYER_ONE, PLAYER_TWO, PLAYER_THREE, PLAYER_FOUR, PLAYER_FIVE]

export const getCharacterByID = async (id: number): Promise<CharacterSchema> => {
    console.log(id, CHARACTERS_NAME[id])
    return (await getApiCLient().characters.getCharacterCharactersNameGet(CHARACTERS_NAME[id])).data.data
}

type ActionLoop = {
    actionType: 'craft' | 'gather' | 'fight'
    actionName?: ResourceSchemaSkillEnum | CraftSchemaSkillEnum
    level?: number
}

export const getCharacterActions = (playerName: string): ActionLoop[] => {
    switch (playerName) {
        case PLAYER_ONE:
            return [
                {
                    actionType: 'craft',
                    actionName: 'weaponcrafting',
                },
                {
                    actionType: 'craft',
                    actionName: 'mining',
                    level: 1,
                },
                {
                    actionType: 'craft',
                    actionName: 'mining',
                    level: 20,
                },
                {
                    actionType: 'craft',
                    actionName: 'mining',
                    level: 10,
                },
                {
                    actionType: 'gather',
                    actionName: 'mining',
                    level: 1,
                },
                {
                    actionType: 'gather',
                    actionName: 'mining',
                    level: 10,
                },
            ]
        case PLAYER_TWO:
            return [
                {
                    actionType: 'craft',
                    actionName: 'gearcrafting',
                },
                {
                    actionType: 'gather',
                    actionName: 'mining',
                    level: 1,
                },
                {
                    actionType: 'gather',
                    actionName: 'mining',
                    level: 10,
                },
            ]
        case PLAYER_THREE:
            return [
                {
                    actionType: 'gather',
                    actionName: 'woodcutting',
                    level: 1,
                },
                {
                    actionType: 'gather',
                    actionName: 'woodcutting',
                    level: 10,
                },
            ]
        case PLAYER_FOUR:
            return [
                {
                    actionType: 'craft',
                    actionName: 'jewelrycrafting',
                },
                {
                    actionType: 'craft',
                    actionName: 'woodcutting',
                    level: 1,
                },
                {
                    actionType: 'craft',
                    actionName: 'woodcutting',
                    level: 20,
                },
                {
                    actionType: 'craft',
                    actionName: 'woodcutting',
                    level: 10,
                },
                {
                    actionType: 'gather',
                    actionName: 'woodcutting',
                    level: 1,
                },
                {
                    actionType: 'gather',
                    actionName: 'woodcutting',
                    level: 10,
                },
            ]
        case PLAYER_FIVE:
            return [
                {
                    actionType: 'craft',
                    actionName: 'cooking',
                },
                {
                    actionType: 'gather',
                    actionName: 'fishing',
                },
            ]
        default:
            return [
                {
                    actionType: 'gather',
                    actionName: 'mining',
                },
            ]
    }
}
