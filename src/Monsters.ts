import { DataPageMonsterSchema, MonsterSchema } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'
import { COLLECTION_NAME_FOR_MONSTERS, MonsterDocument } from './db/models/MonsterDocument'
import { Db } from 'mongodb'
import { connectToMongo } from './db/dbDriver'
import { MAX_PAGE_SIZE } from './Utils'

const apiClient = getApiCLient()

export const syncMonsters = async (): Promise<void> => {
    console.log('Start monsters sync')
    const monstersDataPage: DataPageMonsterSchema = (await apiClient.monsters.getAllMonstersMonstersGet(undefined, undefined, undefined, 1, 1)).data

    if (monstersDataPage.total === null) {
        throw new Error('Could not retrive monsters information')
    }

    for (let i = 0; i < monstersDataPage.total / MAX_PAGE_SIZE; i++) {
        const monstersList: MonsterSchema[] = (await apiClient.monsters.getAllMonstersMonstersGet(undefined, undefined, undefined, i + 1, MAX_PAGE_SIZE)).data.data
        await Promise.allSettled(
            monstersList.map(async (monster: MonsterSchema) => {
                const monsterDocument = new MonsterDocument(monster)
                await monsterDocument.upsert()
            }),
        )
    }
    console.log('Monsters sync done')
}

export const findMonsterByName = async (monsterName: string): Promise<MonsterDocument[]> => {
    const dbClient: Db = await connectToMongo()
    return await dbClient.collection<MonsterDocument>(COLLECTION_NAME_FOR_MONSTERS).find({ code: monsterName }).toArray()
}
