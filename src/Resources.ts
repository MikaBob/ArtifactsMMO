import { DataPageResourceSchema, ResourceSchema, ResourceSchemaSkillEnum } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'
import { COLLECTION_NAME_FOR_RESOURCES, ResourceDocument } from './db/models/ResourceDocument'
import { Db } from 'mongodb'
import { connectToMongo } from './db/dbDriver'
import { MAX_PAGE_SIZE } from './Utils'

const apiClient = getApiCLient()

export const syncResources = async (): Promise<void> => {
    console.log('Start resources sync')
    const resourcesDataPage: DataPageResourceSchema = (await apiClient.resources.getAllResourcesResourcesGet(undefined, undefined, undefined, undefined, 1, 1)).data

    if (resourcesDataPage.total === null) {
        throw new Error('Could not retrive resources information')
    }

    for (let i = 0; i < resourcesDataPage.total / MAX_PAGE_SIZE; i++) {
        const resourcesList: ResourceSchema[] = (await apiClient.resources.getAllResourcesResourcesGet(undefined, undefined, undefined, undefined, i + 1, MAX_PAGE_SIZE)).data.data
        await Promise.allSettled(
            resourcesList.map(async (resource: ResourceSchema) => {
                const resourceDocument = new ResourceDocument(resource)
                await resourceDocument.upsert()
            }),
        )
    }
    console.log('Resources sync done')
}

export const findResourceBySkill = async (skill: ResourceSchemaSkillEnum, skillLevel: number): Promise<ResourceSchema[]> => {
    const dbClient: Db = await connectToMongo()
    return await dbClient.collection<ResourceSchema>(COLLECTION_NAME_FOR_RESOURCES).find({ level: skillLevel, skill: skill }).toArray()
}
