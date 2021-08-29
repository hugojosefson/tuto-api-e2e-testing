export const config = {
  db: {
    database: process.env.APP_DB_DATABASE,
    host: process.env.APP_DB_HOST,
    user: process.env.APP_DB_USER,
    password: process.env.APP_DB_PASSWORD
  },
  app: {
    externalUrl: process.env.APP_EXTERNAL_URL || 'https://disify.com/api/email/'
  }
}
