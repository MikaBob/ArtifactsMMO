import { getCharacterByID } from './Character'
import Player from './Player'
import { getLowestTenOfLevel } from './Utils'

export const main = async () => {
    //Game start

    const swidz = new Player(await getCharacterByID(1))
    Promise.resolve().then(function resolver(): unknown {
        return swidz.craftItem('mining', 1).then(resolver)
    })

    /* 
    const nolie = new Player(await getCharacterByID(2))
    Promise.resolve().then(function resolver(): unknown {
        return nolie.craftItem('mining').then(resolver)
    })
 */
    /* 
    const blargh = new Player(await getCharacterByID(3))
    Promise.resolve().then(function resolver(): unknown {
        return blargh.gatherResource('woodcutting').then(resolver)
    })
 */
    /* 
    const niebieska = new Player(await getCharacterByID(4))
    Promise.resolve().then(function resolver(): unknown {
        return niebieska.gatherResource('woodcutting').then(resolver)
    })
 */
    /* 
    const chief = new Player(await getCharacterByID(5))
    Promise.resolve().then(function resolver(): unknown {
        return chief.gatherResource('fishing').then(resolver)
    })
 */
    // Game Over
}

main()
