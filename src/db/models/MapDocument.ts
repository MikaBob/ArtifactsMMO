import { MapContentSchema, MapSchema } from 'artifactsmmo-sdk'
import { MongoDBDocument } from './MongoDBDocument'

const COLLECTION_NAME_FOR_MAPS = 'maps'

export class MapDocument extends MongoDBDocument implements MapSchema {
    name: string
    skin: string
    x: number
    y: number
    content: MapContentSchema | null

    constructor(map: MapSchema) {
        super(map.x + '.' + map.y)
        this.name = map.name
        this.skin = map.skin
        this.x = map.x
        this.y = map.y
        this.content = map.content
    }

    getAssociatedCollectionName(): string {
        return COLLECTION_NAME_FOR_MAPS
    }
}
