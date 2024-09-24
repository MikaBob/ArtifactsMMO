import { init } from './ApiClient'

const apiClient = init()

export const main = async () => {
    const myChar = await apiClient.myCharacters.getMyCharactersMyCharactersGet()
    console.log(myChar)
}

main()
