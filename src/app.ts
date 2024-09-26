import { Craft, Gather, GoToCopperRocks, GoToForge } from './Actions'

export const main = async () => {
    loopToGetCopperBars(25)
}

main()

function loopToGetCopperBars(desiredAmount: number) {
    // eslint-disable-next-line no-async-promise-executor
    new Promise<void>(async () => {
        for (let i = 1; i < desiredAmount + 1; i++) {
            await GoToCopperRocks()
            for (let j = 0; j < 8; j++) {
                await Gather()
                console.log(`Copper ore gathered: ${j}/8`)
            }
            await GoToForge()
            await Craft('copper')
            console.log(`Copper bar crafted: ${i}/${desiredAmount}`)
        }
    })
}
