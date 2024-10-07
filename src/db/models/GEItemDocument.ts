import { GEItemSchema } from 'artifactsmmo-sdk'
import { MongoDBDocument } from './MongoDBDocument'

export const COLLECTION_NAME_FOR_GEITEMS = 'GEItems'

export class GEItemDocument extends MongoDBDocument implements GEItemSchema {
    creation_date: number
    code: string
    stock: number
    sell_price: number | undefined
    buy_price: number | undefined
    max_quantity: number

    constructor(GEItem: GEItemSchema) {
        const creationDate = new Date().getTime()
        super(GEItem.code + '_' + creationDate)
        this.creation_date = creationDate
        this.code = GEItem.code
        this.stock = GEItem.stock
        this.sell_price = GEItem.sell_price
        this.buy_price = GEItem.buy_price
        this.max_quantity = GEItem.max_quantity
    }

    getAssociatedCollectionName(): string {
        return COLLECTION_NAME_FOR_GEITEMS
    }
}
