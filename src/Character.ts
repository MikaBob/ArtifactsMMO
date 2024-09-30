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
}

export const getCharacterActions = (playerName: PlayerName): ActionLoop[] => {
    switch (playerName) {
        case 'Swidz':
            return [
                {
                    actionType: 'craft',
                    actionName: 'mining',
                    level: 10,
                },
                {
                    actionType: 'gather',
                    actionName: 'mining',
                    level: 10,
                },
            ]
        case 'Nolie':
        case 'Blargh':
            return [
                {
                    actionType: 'fight',
                    actionName: 'cow',
                },
            ]
        case 'Niebieska':
            return [
                {
                    actionType: 'craft',
                    actionName: 'jewelrycrafting',
                },
                {
                    actionType: 'craft',
                    actionName: 'mining',
                    level: 1,
                },
                {
                    actionType: 'gather',
                    actionName: 'mining',
                    level: 10,
                },
            ]
        case 'Chief':
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
