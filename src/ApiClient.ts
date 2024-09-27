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

let APIClient: APITypes | null = null

const init = () => {
    const instance = axios.create({})

    instance.interceptors.response.use(
        async success => {
            return success
        },
        // retry logic for 499 rate-limit errors
        async error => {
            const apiError = error.response?.data?.error
            if (error.response !== undefined) {
                const { method, url, data } = error.response.config
                console.error(`API error ${method.toUpperCase()} ${url} ${data ?? ''}`, apiError)
            }
            if (error.response?.status === 499) {
                const retryAfter = error.response.headers['retry-after'] ?? 2

                await new Promise(resolve => {
                    setTimeout(resolve, retryAfter * 1000)
                })

                return instance.request(error.config)
            }

            return { data: { data: undefined } }
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
