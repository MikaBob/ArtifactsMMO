import { DataPageMapSchema, MapSchema } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'
import { MapDocument } from './db/models/MapDocument'

const MAX_MAP_PAGE_SIZE = 100

const apiClient = getApiCLient()

export const syncMaps = async () => {
    console.log('Start map sync')
    const mapsDataPage: DataPageMapSchema = (await apiClient.maps.getAllMapsMapsGet(undefined, undefined, 1, 1)).data

    if (mapsDataPage.total === null) {
        throw new Error('Could not retrive maps information')
    }

    for (let i = 0; i < mapsDataPage.total / MAX_MAP_PAGE_SIZE; i++) {
        const mapsList: MapSchema[] = (await apiClient.maps.getAllMapsMapsGet(undefined, undefined, i + 1, MAX_MAP_PAGE_SIZE)).data.data
        await Promise.allSettled(
            mapsList.map(async (map: MapSchema) => {
                const mapDocument = new MapDocument(map)
                await mapDocument.upsert()
            }),
        )
    }
    console.log('Map sync done')
}
