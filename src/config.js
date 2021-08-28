export const config = {
  db: {
    database: process.env.APP_DB_DATABASE,
    host: process.env.APP_DB_HOST,
    user: process.env.APP_DB_USER,
    password: process.env.APP_DB_PASSWORD
  },
  redis: {
    host: process.env.APP_REDIS_HOST || 'localhost',
    port: process.env.APP_REDIS_PORT || '6379'
  },
  app: {
    externalUrl: process.env.APP_EXTERNAL_URL || 'https://superservice.com/api'
  }
}
