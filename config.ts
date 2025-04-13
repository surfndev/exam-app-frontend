// src/config/index.ts

const DEV_BASE_URL = 'http://192.168.0.101:8000'
const PROD_BASE_URL = 'https://your-production-url.com'
const STAGING_BASE_URL = 'https://your-staging-url.com'

type Environment = 'dev' | 'staging' | 'prod'

interface EnvConfig {
  BASE_URL: string
  API_VERSION: string
}

interface Environments {
  dev: EnvConfig
  staging: EnvConfig
  prod: EnvConfig
}

const ENV: Environments = {
  dev: {
    BASE_URL: DEV_BASE_URL,
    API_VERSION: 'api/v1',
  },
  staging: {
    BASE_URL: STAGING_BASE_URL,
    API_VERSION: 'api/v1',
  },
  prod: {
    BASE_URL: PROD_BASE_URL,
    API_VERSION: 'api/v1',
  },
}

const getEnvVars = (env: Environment = 'dev'): EnvConfig => {
  return ENV[env]
}

const currentEnv = getEnvVars('dev') // You can change this based on your environment

export const API_CONFIG = {
  BASE_URL: currentEnv.BASE_URL,
  API_VERSION: currentEnv.API_VERSION,
  API_ENDPOINT: `${currentEnv.BASE_URL}/${currentEnv.API_VERSION}`,
}

export const createApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.API_ENDPOINT}/${endpoint.replace(/^\//, '')}`
}