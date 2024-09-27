import { ACCOUNT_TOKEN } from '../.env.js'
import axios from 'axios'
import { CharactersApi, Configuration, MapsApi, MyCharactersApi, ResourcesApi } from 'artifactsmmo-sdk'

const ARTIFACTSMMO_API_ENDPOINT = 'https://api.artifactsmmo.com'

type APITypes = {
    myCharacters: MyCharactersApi
    characters: CharactersApi
    maps: MapsApi
    resources: ResourcesApi
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
        characters: new CharactersApi(configuration, undefined, instance),
        maps: new MapsApi(configuration, undefined, instance),
        resources: new ResourcesApi(configuration, undefined, instance),
    }
    console.log(`Client API initialized`)

    return APIClient
}

const getApiCLient = (): APITypes => {
    if (APIClient === null) init()
    return APIClient as APITypes
}

export { getApiCLient }
