import env from 'dotenv'
import axios from 'axios'
import { Configuration, MyCharactersApi } from 'artifactsmmo-sdk'

env.config()

const { ACCOUNT_TOKEN } = process.env
const ARTIFACTSMMO_API_ENDPOINT = 'https://api.artifactsmmo.com'

type APITypes = {
    myCharacters: MyCharactersApi
}

let APIClient: APITypes

const init = () => {
    const instance = axios.create({})

    instance.interceptors.response.use(
        // return data directly
        async success => {
            return success.data.data
        },
        // retry logic for 429 rate-limit errors
        async error => {
            const apiError = error.response?.data?.error
            const { method, url, data } = error.response.config

            console.error(`API error ${method.toUpperCase()} ${url} ${data ?? ''}`, apiError)

            if (error.response?.status === 429) {
                const retryAfter = error.response.headers['retry-after']

                await new Promise(resolve => {
                    setTimeout(resolve, retryAfter * 1000)
                })

                return instance.request(error.config)
            }

            return { data: { data: undefined } }
        },
    )

    if ((ACCOUNT_TOKEN ?? '') === '') throw new Error('Invalid token provided')

    const configuration = new Configuration({
        basePath: ARTIFACTSMMO_API_ENDPOINT ?? '',
        accessToken: ACCOUNT_TOKEN ?? '',
    })

    APIClient = {
        myCharacters: new MyCharactersApi(configuration, undefined, instance),
    }
    console.log(`Client API initialized`)

    return APIClient
}

export { init }
