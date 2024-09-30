import { CraftAction, FightAction, GatherAction, getCharacterActions, getCharacterByName } from './Character'
import Player from './Player'

export const main = async () => {
    //Game start

    const playerName: string = process.argv[2]
    const player = new Player(await getCharacterByName(playerName))

    Promise.resolve().then(async function resolver(): Promise<void> {
        const actionsToDo = getCharacterActions(player.getStats().name)
        for (let i = 0; i < actionsToDo.length; i++) {
            try {
                if (actionsToDo[i].actionType === 'craft') {
                    const craftAction = actionsToDo[i] as CraftAction
                    await player.craftItems(craftAction.actionName, craftAction.level)
                } else if (actionsToDo[i].actionType === 'gather') {
                    const gathrerAction = actionsToDo[i] as GatherAction
                    await player.gatherResource(gathrerAction.actionName, gathrerAction.level)
                } else if (actionsToDo[i].actionType === 'fight') {
                    const fightAction = actionsToDo[i] as FightAction
                    await player.fightMonster(fightAction.actionName)
                }
            } catch (error) {
                console.error(error)
            }
        }
        resolver()
    })

    // Game Over
}

main()
