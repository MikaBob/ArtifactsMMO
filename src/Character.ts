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
export enum ActionType {
    Gather = 'gather',
    Craft = 'craft',
    Fight = 'fight',
}
export type ActionLoop = (GatherAction | CraftAction | FightAction) & {
    repeatFor: number
}

export type GatherAction = {
    actionType: ActionType.Gather
    actionName: ResourceSchemaSkillEnum
    level?: number
}

export type CraftAction = {
    actionType: ActionType.Craft
    actionName: CraftSchemaSkillEnum
    level?: number
}

export type FightAction = {
    actionType: ActionType.Fight
    actionName: MonsterEnum
    amount?: number
}

export const getCharacterActions = (playerName: PlayerName): ActionLoop[] => {
    switch (playerName) {
        case 'Swidz':
            return [
                {
                    actionType: ActionType.Craft,
                    actionName: CraftSchemaSkillEnum.Weaponcrafting,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: CraftSchemaSkillEnum.Weaponcrafting,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: CraftSchemaSkillEnum.Weaponcrafting,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Gather,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    level: 10,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    level: 10,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    level: 10,
                    repeatFor: -1,
                },
            ]
        case 'Nolie':
            return [
                {
                    actionType: ActionType.Gather,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Fight,
                    actionName: MonsterEnum.Pig,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Fight,
                    actionName: MonsterEnum.Skeleton,
                    repeatFor: -1,
                },
            ]
        case 'Blargh':
            return [
                {
                    actionType: ActionType.Gather,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    level: 10,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    level: 10,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    level: 10,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Fight,
                    actionName: MonsterEnum.Green_Slime,
                    amount: 112,
                    repeatFor: 1,
                },
                {
                    actionType: ActionType.Fight,
                    actionName: MonsterEnum.Pig,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Fight,
                    actionName: MonsterEnum.Skeleton,
                    repeatFor: -1,
                },
            ]
        case 'Niebieska':
            return [
                
                {
                    actionType: ActionType.Craft,
                    actionName: CraftSchemaSkillEnum.Jewelrycrafting,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: CraftSchemaSkillEnum.Jewelrycrafting,
                    repeatFor: -1,
                },
                
                {
                    actionType: ActionType.Fight,
                    actionName: MonsterEnum.Skeleton,
                    amount: 122,
                    repeatFor: 1,
                },
                {
                    actionType: ActionType.Gather,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    repeatFor: -1,
                },
            ]
        case 'Chief':
            return [
                {
                    actionType: ActionType.Gather,
                    actionName: ResourceSchemaSkillEnum.Woodcutting,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: ResourceSchemaSkillEnum.Woodcutting,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: ResourceSchemaSkillEnum.Woodcutting,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Gather,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    repeatFor: -1,
                },
                {
                    actionType: ActionType.Craft,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    repeatFor: -1,
                },
            ]
        default:
            return [
                {
                    actionType: ActionType.Gather,
                    actionName: ResourceSchemaSkillEnum.Mining,
                    repeatFor: -1,
                },
            ]
    }
}
