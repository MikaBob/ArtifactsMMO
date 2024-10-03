import { CraftSchema, ItemEffectSchema, ItemSchema } from 'artifactsmmo-sdk'
import { MongoDBDocument } from './MongoDBDocument'

export const COLLECTION_NAME_FOR_ITEMS = 'items'

export class ItemDocument extends MongoDBDocument implements ItemSchema {
    name: string
    code: string
    level: number
    type: string
    subtype: string
    description: string
    effects?: ItemEffectSchema[] | undefined
    craft?: CraftSchema | null | undefined

    constructor(item: ItemSchema) {
        super(item.code)
        this.name = item.name
        this.code = item.code
        this.level = item.level
        this.type = item.type
        this.subtype = item.subtype
        this.description = item.description
        this.effects = item.effects
        this.craft = item.craft
    }

    getAssociatedCollectionName(): string {
        return COLLECTION_NAME_FOR_ITEMS
    }
}
