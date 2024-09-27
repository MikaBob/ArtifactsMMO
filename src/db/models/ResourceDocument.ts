import { DropRateSchema, ResourceSchema, ResourceSchemaSkillEnum } from 'artifactsmmo-sdk'
import { MongoDBDocument } from './MongoDBDocument'

const COLLECTION_NAME_FOR_RESOURCES = 'resources'

export type ResourceQuery = {
    drops: Array<DropRateSchema>
    max_level: number
    min_level: number
    skill: ResourceSchemaSkillEnum
}

export class ResourceDocument extends MongoDBDocument implements ResourceSchema {
    name: string
    code: string
    skill: ResourceSchemaSkillEnum
    level: number
    drops: Array<DropRateSchema>

    constructor(resource: ResourceSchema) {
        super(resource.code)
        this.name = resource.name
        this.code = resource.code
        this.skill = resource.skill
        this.level = resource.level
        this.drops = resource.drops
    }

    getAssociatedCollectionName(): string {
        return COLLECTION_NAME_FOR_RESOURCES
    }
}
