import { CraftSchemaSkillEnum, DataPageItemSchema, DataPageResourceSchema, ItemSchema, ResourceSchema, ResourceSchemaSkillEnum, SimpleItemSchema } from 'artifactsmmo-sdk'
import { getApiCLient } from './ApiClient'
import { ResourceDocument } from './db/models/ResourceDocument'

const MAX_RESOURCES_PAGE_SIZE = 100
const apiClient = getApiCLient()

export const syncResources = async (): Promise<void> => {
    console.log('Start resources sync')
    const resourcesDataPage: DataPageResourceSchema = (await apiClient.resources.getAllResourcesResourcesGet(undefined, undefined, undefined, undefined, 1, 1)).data

    if (resourcesDataPage.total === null) {
        throw new Error('Could not retrive resources information')
    }

    for (let i = 0; i < resourcesDataPage.total / MAX_RESOURCES_PAGE_SIZE; i++) {
        const resourcesList: ResourceSchema[] = (await apiClient.resources.getAllResourcesResourcesGet(undefined, undefined, undefined, undefined, i + 1, MAX_RESOURCES_PAGE_SIZE)).data.data
        await Promise.allSettled(
            resourcesList.map(async (resource: ResourceSchema) => {
                const resourceDocument = new ResourceDocument(resource)
                await resourceDocument.upsert()
            }),
        )
    }
    console.log('Resources sync done')
}

export const findResourceBySkill = async (skill: ResourceSchemaSkillEnum, skillLevel: number): Promise<ResourceSchema> => {
    const resourcesDataPage: DataPageResourceSchema = (await apiClient.resources.getAllResourcesResourcesGet(skillLevel, skillLevel, skill, undefined, 1, MAX_RESOURCES_PAGE_SIZE)).data
    return resourcesDataPage.data[0]
}

export const findItemsBySkill = async (skill: CraftSchemaSkillEnum, skillLevel: number): Promise<ItemSchema[]> => {
    const resourcesDataPage: DataPageItemSchema = (await apiClient.items.getAllItemsItemsGet(skillLevel, skillLevel, undefined, undefined, skill, undefined, 1, MAX_RESOURCES_PAGE_SIZE)).data
    return resourcesDataPage.data
}

export const getItemsInBank = async (): Promise<SimpleItemSchema[]> => {
    return (await apiClient.myAccount.getBankItemsMyBankItemsGet(undefined, 1, 100)).data.data
}
