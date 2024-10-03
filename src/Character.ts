import { CharacterSchema, CraftSchemaSkillEnum, ResourceSchemaSkillEnum } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'

export const PlayerName = {
    Swidz: 'Swidz',
    Nolie: 'Nolie',
    Blargh: 'Blargh',
    Niebieska: 'Niebieska',
    Chief: 'Chief',
}

export type PlayerName = (typeof PlayerName)[keyof typeof PlayerName]

export const getCharacterByName = async (name: PlayerName): Promise<CharacterSchema> => {
    console.log(name)
    return (await getApiCLient().characters.getCharacterCharactersNameGet(name)).data.data
}

export type ActionLoop = GatherAction | CraftAction | FightAction

export type GatherAction = {
    actionType: 'gather'
    actionName: ResourceSchemaSkillEnum
    level?: number
}

export type CraftAction = {
    actionType: 'craft'
    actionName: CraftSchemaSkillEnum
    level?: number
}

export type FightAction = {
    actionType: 'fight'
    actionName: string
    amount?: number
}

export const getCharacterActions = (playerName: PlayerName): ActionLoop[] => {
    switch (playerName) {
        case 'Swidz':
            return [
                {
                    actionType: 'fight',
                    actionName: 'skeleton',
                },
                {
                    actionType: 'gather',
                    actionName: 'woodcutting',
                    level: 10,
                },
                {
                    actionType: 'craft',
                    actionName: 'woodcutting',
                    level: 10,
                },

                {
                    actionType: 'fight',
                    actionName: 'blue_slime',
                },
            ]
        case 'Nolie':
            return [
                {
                    actionType: 'craft',
                    actionName: 'gearcrafting',
                },
                {
                    actionType: 'craft',
                    actionName: 'gearcrafting',
                },
                {
                    actionType: 'craft',
                    actionName: 'gearcrafting',
                },
                {
                    actionType: 'fight',
                    actionName: 'blue_slime',
                },
                {
                    actionType: 'fight',
                    actionName: 'cow',
                },
            ]
        case 'Blargh':
            return [
                {
                    actionType: 'fight',
                    actionName: 'cow',
                },
                {
                    actionType: 'gather',
                    actionName: 'mining',
                    level: 10,
                },
                {
                    actionType: 'craft',
                    actionName: 'mining',
                    level: 10,
                },
                {
                    actionType: 'fight',
                    actionName: 'skeleton',
                },
            ]
        case 'Niebieska':
            return [
                {
                    actionType: 'fight',
                    actionName: 'cow',
                },
                {
                    actionType: 'craft',
                    actionName: 'jewelrycrafting',
                    level: 10,
                },
                {
                    actionType: 'gather',
                    actionName: 'mining',
                    level: 10,
                },
                {
                    actionType: 'craft',
                    actionName: 'mining',
                    level: 10,
                },
                {
                    actionType: 'fight',
                    actionName: 'blue_slime',
                },
            ]
        case 'Chief':
            return [
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
