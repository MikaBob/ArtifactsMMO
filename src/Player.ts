import { CharacterFightDataSchema, CharacterMovementDataSchema, CharacterSchema, SkillDataSchema } from 'artifactsmmo-sdk'
import { GoToCopperRocks, Gather, GoToForge, Craft } from './Actions'
import { waitForCooldown } from './Utils'

export default class Player {
    private me: CharacterSchema

    constructor(character: CharacterSchema) {
        this.me = character
    }

    updateCharacter(updatedCharacter: CharacterSchema) {
        if (this.getCharacter.name === updatedCharacter.name) this.me = updatedCharacter
    }

    getCharacter() {
        return this.me
    }

    async postActionCallback(data: CharacterMovementDataSchema | CharacterFightDataSchema | SkillDataSchema) {
        this.updateCharacter(data.character)
        await waitForCooldown(data.cooldown)
    }

    loopToGetCopperBars(desiredAmount: number) {
        // eslint-disable-next-line no-async-promise-executor
        new Promise<void>(async () => {
            for (let i = 1; i < desiredAmount + 1; i++) {
                await GoToCopperRocks(this.me.name)
                for (let j = 0; j < 8; j++) {
                    await Gather(this.me.name)
                    console.log(`Copper ore gathered: ${j}/8`)
                }
                await GoToForge(this.me.name)
                await Craft(this.me.name, 'copper')
                console.log(`Copper bar crafted: ${i}/${desiredAmount}`)
            }
        })
    }
}
