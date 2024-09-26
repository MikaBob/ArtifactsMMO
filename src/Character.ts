import { CharacterSchema } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'

export const MAIN_CHARACTER_NAME = 'Swidz'

let mainCharacter: CharacterSchema | null = null
export const getMainCharacter = async (refresh = false) => {
    if (!refresh && mainCharacter !== null) return mainCharacter
    mainCharacter = (await getApiCLient().characters.getCharacterCharactersNameGet(MAIN_CHARACTER_NAME)).data.data
    return mainCharacter
}

export const updateCharacter = (updatedCharacter: CharacterSchema) => {
    mainCharacter = updatedCharacter
}
