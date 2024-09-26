import { CharacterSchema } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'

export const PLAYER_ONE = 'Swidz'
export const PLAYER_TWO = 'Nolie'
export const PLAYER_THREE = 'Blargh'
export const PLAYER_FOUR = 'Niebieska'
export const CHARACTERS_NAME = ['', PLAYER_ONE, PLAYER_TWO, PLAYER_THREE, PLAYER_FOUR]

export const getCharacterByID = async (id: number): Promise<CharacterSchema> => {
    return (await getApiCLient().characters.getCharacterCharactersNameGet(CHARACTERS_NAME[id])).data.data
}
