import { ACCOUNT_TOKEN } from '../.env.js'
import axios from 'axios'
import {
    AccountsApi,
    AchievementsApi,
    CharactersApi,
    Configuration,
    EventsApi,
    GrandExchangeApi,
    ItemsApi,
    LeaderboardApi,
    MapsApi,
    MonstersApi,
    MyAccountApi,
    MyCharactersApi,
    ResourcesApi,
    TasksApi,
    TokenApi,
} from 'artifactsmmo-sdk'
import { ERROR_CODE_STILL_IN_COOLDOWN } from './Const.js'

const ARTIFACTSMMO_API_ENDPOINT = 'https://api.artifactsmmo.com'

type APITypes = {
    myCharacters: MyCharactersApi
    myAccount: MyAccountApi
    characters: CharactersApi
    maps: MapsApi
    items: ItemsApi
    monsters: MonstersApi
    resources: ResourcesApi
    events: EventsApi
    grandExchange: GrandExchangeApi
    tasks: TasksApi
    achievements: AchievementsApi
    leaderboard: LeaderboardApi
    accounts: AccountsApi
    token: TokenApi
}

export type APIErrorType = {
    code: number
    message: string
    data: undefined
}

let APIClient: APITypes | null = null

const init = () => {
    const instance = axios.create({})

    instance.interceptors.response.use(
        async success => {
            return success
        },
        // retry logic for 499 rate-limit errors
        async error => {
            const apiError: APIErrorType | undefined = error.response?.data?.error
            if (error.response !== undefined) {
                const { method, url, data } = error.response.config
                console.error(`API error ${method.toUpperCase()} ${url} ${data ?? ''}`, error.response.data)
            } else {
                console.error(error)
            }

            if (error.response.status > 499) {
                console.error(`Error code ${error.response.status}`, error)
                await new Promise(resolve => {
                    setTimeout(resolve, 10 * 1000)
                })
                return instance.request(error.config)
            }

            if (apiError?.code === ERROR_CODE_STILL_IN_COOLDOWN) {
                const regexResult = /(\d+\.\d+) seconds.+/.exec(apiError.message ?? '')
                const retryAfter = regexResult !== null ? parseInt(regexResult[1]) + 1 : 3

                console.log(`Waiting for ${retryAfter}sec before re-trying request`)
                await new Promise(resolve => {
                    setTimeout(resolve, retryAfter * 1000)
                })
                return instance.request(error.config)
            }

            return { data: apiError }
        },
    )

    if (!ACCOUNT_TOKEN) throw new Error('Invalid token provided')

    const configuration = new Configuration({
        basePath: ARTIFACTSMMO_API_ENDPOINT ?? '',
        accessToken: ACCOUNT_TOKEN ?? '',
    })

    APIClient = {
        myCharacters: new MyCharactersApi(configuration, undefined, instance),
        myAccount: new MyAccountApi(configuration, undefined, instance),
        characters: new CharactersApi(configuration, undefined, instance),
        maps: new MapsApi(configuration, undefined, instance),
        items: new ItemsApi(configuration, undefined, instance),
        monsters: new MonstersApi(configuration, undefined, instance),
        resources: new ResourcesApi(configuration, undefined, instance),
        events: new EventsApi(configuration, undefined, instance),
        grandExchange: new GrandExchangeApi(configuration, undefined, instance),
        tasks: new TasksApi(configuration, undefined, instance),
        achievements: new AchievementsApi(configuration, undefined, instance),
        leaderboard: new LeaderboardApi(configuration, undefined, instance),
        accounts: new AccountsApi(configuration, undefined, instance),
        token: new TokenApi(configuration, undefined, instance),
    }
    console.log(`Client API initialized`)

    return APIClient
}

const getApiCLient = (): APITypes => {
    if (APIClient === null) init()
    return APIClient as APITypes
}

export { getApiCLient }
