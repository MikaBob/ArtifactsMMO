import { DataPageMapSchema, DestinationSchema, MapSchema } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'
import { COLLECTION_NAME_FOR_MAPS, MapDocument } from './db/models/MapDocument'
import { Db } from 'mongodb'
import { connectToMongo } from './db/dbDriver'
import { MAX_PAGE_SIZE } from './Utils'

const apiClient = getApiCLient()

export const syncMaps = async () => {
    console.log('Start maps sync')
    const mapsDataPage: DataPageMapSchema = (await apiClient.maps.getAllMapsMapsGet(undefined, undefined, 1, 1)).data

    if (mapsDataPage.total === null) {
        throw new Error('Could not retrive maps information')
    }

    for (let i = 0; i < mapsDataPage.total / MAX_PAGE_SIZE; i++) {
        const mapsList: MapSchema[] = (await apiClient.maps.getAllMapsMapsGet(undefined, undefined, i + 1, MAX_PAGE_SIZE)).data.data
        await Promise.allSettled(
            mapsList.map(async (map: MapSchema) => {
                const mapDocument = new MapDocument(map)
                await mapDocument.upsert()
            }),
        )
    }
    console.log('Maps sync done')
}

export const findMapsWithContent = async (contentToSearch: string): Promise<MapDocument[]> => {
    const dbClient: Db = await connectToMongo()
    return await dbClient.collection<MapDocument>(COLLECTION_NAME_FOR_MAPS).find({ 'content.code': contentToSearch }).toArray()
}

export const getClosestMapFromDestination = async (mapsHaystack: MapDocument[], destination: DestinationSchema): Promise<MapDocument> => {
    if (mapsHaystack.length < 1) throw new Error('getClosestMapFromDestination Map haystack can not be empty')
    let closestMap: MapDocument = mapsHaystack[0]
    mapsHaystack.map((mapToCheck: MapDocument) => {
        const mapToCheckdistanceWithDestination = Math.abs(destination.x - mapToCheck.x) + Math.abs(destination.y - mapToCheck.y)
        const closestMapdistanceWithDestination = Math.abs(destination.x - closestMap.x) + Math.abs(destination.y - closestMap.y)
        if (mapToCheckdistanceWithDestination < closestMapdistanceWithDestination) closestMap = mapToCheck
    })
    return closestMap
}
