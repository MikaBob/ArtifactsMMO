import { DestinationSchema } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'
import { getMainCharacter } from './Character'

const apiClient = getApiCLient()

const MoveRelatively = async (alongX: number, alongY: number) => {
    const mainCharater = await getMainCharacter(true)
    const newX = mainCharater.x + alongX
    const newY = mainCharater.y + alongY
    console.log('Moving to ' + newX + '.' + newY)
    apiClient.myCharacters.actionMoveMyNameActionMovePost(mainCharater.name, fromCoordinatesToDestination(newX, newY))
}

export const MoveDown = async () => {
    MoveRelatively(0, 1)
}
export const MoveUp = async () => {
    MoveRelatively(0, -1)
}
export const MoveRight = async () => {
    MoveRelatively(1, 0)
}
export const MoveLeft = async () => {
    MoveRelatively(-1, 0)
}

export const fromCoordinatesToDestination = (x: number, y: number): DestinationSchema => {
    return { x: x, y: y } as DestinationSchema
}
