import { CraftSchemaSkillEnum, DataPageItemSchema, GetAllItemsItemsGetTypeEnum, ItemSchema, SimpleItemSchema } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'
import { COLLECTION_NAME_FOR_ITEMS, ItemDocument } from './db/models/ItemDocument'
import { connectToMongo, Db } from './db/dbDriver'
import { MAX_PAGE_SIZE } from './Utils'

const apiClient = getApiCLient()

export const syncItems = async (): Promise<void> => {
    console.log('Start items sync')
    const itemsDataPage: DataPageItemSchema = (await apiClient.items.getAllItemsItemsGet(undefined, undefined, undefined, undefined, undefined, undefined, 1, 1)).data

    if (itemsDataPage.total === null) {
        throw new Error('Could not retrive items information')
    }

    for (let i = 0; i < itemsDataPage.total / MAX_PAGE_SIZE; i++) {
        const itemsList: ItemSchema[] = (await apiClient.items.getAllItemsItemsGet(undefined, undefined, undefined, undefined, undefined, undefined, i + 1, MAX_PAGE_SIZE)).data.data
        await Promise.allSettled(
            itemsList.map(async (item: ItemSchema) => {
                const itemDocument = new ItemDocument(item)
                await itemDocument.upsert()
            }),
        )
    }
    console.log('Items sync done')
}

export const findItemsByType = async (itemType: GetAllItemsItemsGetTypeEnum): Promise<ItemDocument[]> => {
    const dbClient: Db = await connectToMongo()
    return await dbClient.collection<ItemDocument>(COLLECTION_NAME_FOR_ITEMS).find({ type: itemType }).toArray()
}

export const findItemsBySkill = async (skill: CraftSchemaSkillEnum, minSkillLevel: number, maxSkillLevel: number): Promise<ItemSchema[]> => {
    const dbClient: Db = await connectToMongo()
    return await dbClient
        .collection<ItemDocument>(COLLECTION_NAME_FOR_ITEMS)
        .find({ level: { $gte: minSkillLevel, $lte: maxSkillLevel }, 'craft.skill': skill })
        .toArray()
}

export const getItemsInBank = async (): Promise<SimpleItemSchema[]> => {
    const items = (await apiClient.myAccount.getBankItemsMyBankItemsGet(undefined, 1, 100)).data
    return parsePagingResult(items.data)
}

const parsePagingResult = <Array>(data: Array): Array => {
    return data === null || data === undefined ? ([] as Array) : data
}
