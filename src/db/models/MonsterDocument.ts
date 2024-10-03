import { DropRateSchema, MonsterSchema } from 'artifactsmmo-sdk'
import { MongoDBDocument } from './MongoDBDocument'

export const COLLECTION_NAME_FOR_MONSTERS = 'monsters'

export class MonsterDocument extends MongoDBDocument implements MonsterSchema {
    name: string
    code: string
    level: number
    hp: number
    attack_fire: number
    attack_earth: number
    attack_water: number
    attack_air: number
    res_fire: number
    res_earth: number
    res_water: number
    res_air: number
    min_gold: number
    max_gold: number
    drops: DropRateSchema[]

    constructor(monster: MonsterSchema) {
        super(monster.code)
        this.name = monster.name
        this.code = monster.code
        this.level = monster.level
        this.hp = monster.hp
        this.attack_fire = monster.attack_fire
        this.attack_earth = monster.attack_earth
        this.attack_water = monster.attack_water
        this.attack_air = monster.attack_air
        this.res_fire = monster.res_fire
        this.res_earth = monster.res_earth
        this.res_water = monster.res_water
        this.res_air = monster.res_air
        this.min_gold = monster.min_gold
        this.max_gold = monster.max_gold
        this.drops = monster.drops
    }

    getAssociatedCollectionName(): string {
        return COLLECTION_NAME_FOR_MONSTERS
    }
}
