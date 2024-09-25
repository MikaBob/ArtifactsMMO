import { CharacterSchema } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'
import { syncMaps } from './Maps'

const MAIN_CHARACTER_NAME = 'Swidz'

const apiClient = getApiCLient()

export const main = async () => {
    const mainCharacter: CharacterSchema = (await apiClient.characters.getCharacterCharactersNameGet(MAIN_CHARACTER_NAME)).data.data
    console.log(mainCharacter.x, mainCharacter.y)
    await syncMaps()
}

main()
