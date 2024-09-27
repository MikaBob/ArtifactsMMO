import { CooldownSchema, DestinationSchema } from 'artifactsmmo-sdk'

export const fromCoordinatesToDestination = (x: number, y: number): DestinationSchema => {
    return { x: x, y: y } as DestinationSchema
}

export const waitForCooldown = (cooldown: CooldownSchema): Promise<void> => {
    console.log(`Waiting ${cooldown.reason} cooldown for ${cooldown.remaining_seconds}sec`)
    return new Promise(resolve => setTimeout(resolve, (cooldown.remaining_seconds + 1) * 1000))
}

export const getLowestTenOfLevel = (level: number) => {
    const lowestTen = Math.trunc(level / 10) * 10
    return lowestTen === 0 ? 1 : lowestTen
}
