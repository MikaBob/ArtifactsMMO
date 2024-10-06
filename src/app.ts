import { ActionType, CraftAction, FightAction, GatherAction, getCharacterActions, getCharacterByName, TaskAction } from './Character'
import Player from './Player'

export const main = async () => {
    //Game start

    const playerName: string = process.argv[2]
    const player = new Player(await getCharacterByName(playerName))

    Promise.resolve().then(async function resolver(): Promise<void> {
        try {
            const actionsToDo = getCharacterActions(playerName)
            for (let i = 0; i < actionsToDo.length; i++) {
                if (actionsToDo[i].actionType === ActionType.Craft) {
                    const craftAction = actionsToDo[i] as CraftAction
                    await player.craftItems(craftAction.actionName, craftAction.level)
                } else if (actionsToDo[i].actionType === ActionType.Gather) {
                    const gathrerAction = actionsToDo[i] as GatherAction
                    await player.gatherResource(gathrerAction.actionName, gathrerAction.level)
                } else if (actionsToDo[i].actionType === ActionType.Fight) {
                    const fightAction = actionsToDo[i] as FightAction
                    await player.fightMonster(fightAction.actionName, fightAction.amount)
                } else if (actionsToDo[i].actionType === ActionType.Task) {
                    const taskAction = actionsToDo[i] as TaskAction
                    await player.completeMonsterTask(taskAction.actionName)
                }
                actionsToDo[i].repeatFor--
                if (actionsToDo[i].repeatFor === 0) actionsToDo.splice(i, 1)
            }
        } catch (error) {
            console.error(error)
        } finally {
            resolver()
        }
    })

    // Game Over
}

if (process.argv[2] === undefined) throw new Error('Missing parameter: Character name')
main()
