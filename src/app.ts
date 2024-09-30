import { CraftSchemaSkillEnum, ResourceSchemaSkillEnum } from 'artifactsmmo-sdk'
import { getCharacterActions, getCharacterByID } from './Character'
import Player from './Player'

export const main = async () => {
    //Game start

    const player = new Player(await getCharacterByID(5))
    Promise.resolve().then(async function resolver(): Promise<void> {
        const actionsToDo = getCharacterActions(player.getStats().name)
        for (let i = 0; i < actionsToDo.length; i++) {
            if (actionsToDo[i].actionType === 'craft') {
                await player.craftItems(actionsToDo[i].actionName as CraftSchemaSkillEnum, actionsToDo[i].level)
            } else if (actionsToDo[i].actionType === 'gather') {
                await player.gatherResource(actionsToDo[i].actionName as ResourceSchemaSkillEnum, actionsToDo[i].level)
            }
        }
        resolver()
    })
    /* 
    const player = new Player(await getCharacterByID(2))
    Promise.resolve().then(function resolver(): unknown {
        //return player.emptyInventoryInBank().then(resolver)
        //return player.fight().then(resolver)
        return player.gather().then(resolver)
        //return player.craftItems('mining').then(resolver)
        //return player.gatherResource('mining').then(resolver)
    })
 */
    // Game Over
}

main()
