import { Db, ObjectId, Document, UpdateResult } from 'mongodb'
import { connectToMongo } from '../dbDriver'

class MongoDBDocument implements Document {
    _id: ObjectId
    last_update: number

    constructor(id: number | string) {
        this._id = id as unknown as ObjectId
        this.last_update = new Date().getTime()
    }

    getAssociatedCollectionName(): string {
        throw 'A MongoDBDocument must override method getAssociatedCollectionName().'
    }

    upsert = async (): Promise<boolean> => {
        const dbClient: Db = await connectToMongo()
        const result: UpdateResult = await dbClient
            .collection(this.getAssociatedCollectionName())
            .updateOne(
                { _id: this._id },
                { $set: this },
                { upsert: true, serializeFunctions: false, ignoreUndefined: true },
            )
        return (result.modifiedCount || result.upsertedCount) > 0
    }
}

const fromISODateToTimestamp = (isoDate?: string): number | undefined => {
    if (!isoDate) return undefined
    return new Date(isoDate).getTime()
}

export { fromISODateToTimestamp, MongoDBDocument }
