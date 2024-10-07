import { DataPageGEItemSchema, GEItemSchema } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'
import { GEItemDocument } from './db/models/GEItemDocument'
import { MAX_PAGE_SIZE } from './Utils'

const apiClient = getApiCLient()

export const syncGEItems = async (): Promise<void> => {
    const now = new Date()
    console.log(`Start GEItems sync at ${now.toISOString()}`)
    const GEItemsDataPage: DataPageGEItemSchema = (await apiClient.grandExchange.getAllGeItemsGeGet(1, 1)).data

    if (GEItemsDataPage.total === null) {
        throw new Error('Could not retrive GEItems information')
    }

    for (let i = 0; i < GEItemsDataPage.total / MAX_PAGE_SIZE; i++) {
        const GEItemsList: GEItemSchema[] = (await apiClient.grandExchange.getAllGeItemsGeGet(i + 1, MAX_PAGE_SIZE)).data.data
        await Promise.allSettled(
            GEItemsList.map(async (GEItem: GEItemSchema) => {
                const GEItemDoc = new GEItemDocument(GEItem)
                await GEItemDoc.upsert()
            }),
        )
    }
    console.log('GEItems sync done')
}
