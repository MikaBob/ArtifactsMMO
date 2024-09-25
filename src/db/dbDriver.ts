import { MONGO_DB_HOST, MONGO_DB_PORT, MONGO_DB_USERNAME, MONGO_DB_PASSWORD } from '../../.env.js'
import { Db, MongoClient, MongoClientOptions } from 'mongodb'

const MONGO_DB_DBNAME = 'artifacts_mmo'

const getConnectionString = (): string => {
    let credentials = ''

    if (MONGO_DB_PASSWORD !== '' && MONGO_DB_PASSWORD !== '') {
        credentials += ':' + encodeURIComponent(MONGO_DB_PASSWORD ?? '')
    }

    if (MONGO_DB_USERNAME !== undefined && MONGO_DB_USERNAME !== '') {
        credentials = MONGO_DB_USERNAME + credentials + '@'
    }

    return `mongodb://${credentials}${MONGO_DB_HOST}:${MONGO_DB_PORT}/${MONGO_DB_DBNAME}`
}

const getOptions = (): MongoClientOptions => {
    const mongoDbOptions = {
        connectTimeoutMS: 5 * 1000, // time to wait to establish a single TCP socket connection to the server before raising an error.
        directConnection: true,
        serverSelectionTimeoutMS: 5 * 1000, // timeout to block for server selection before raising an error
        maxIdleTimeMS: 30 * 1000, // time a connection can be idle before it's closed
        checkServerIdentity: () => undefined,
        retryWrites: true,
    } as MongoClientOptions

    return mongoDbOptions
}

const mongoDbClient = new MongoClient(getConnectionString(), getOptions())
let mongoClient: Db | null = null

const connectToMongo = async (): Promise<Db> => {
    if (mongoClient !== null) {
        //console.log('Already connected to MongoDB.')
        return mongoClient
    }

    await mongoDbClient.connect()

    mongoClient = mongoDbClient.db(process.env.MONGODB_DB_NAME || '')
    //console.log('Connected to MongoDB.')

    return mongoClient
}

const disconnectFromMongo = async (): Promise<void> => {
    console.log('Disconnected from MongoDB.')
    mongoClient = null
    await mongoDbClient.close()
}

export { connectToMongo, disconnectFromMongo, Db, mongoClient }
