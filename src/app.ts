import { getCharacterByID } from './Character'
import Player from './Player'

export const main = async () => {
    const swidz = new Player(await getCharacterByID(1))
    swidz.loopToGetCopperBars(7)
}

main()
