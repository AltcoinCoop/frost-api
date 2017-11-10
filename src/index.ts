import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as views from 'koa-views'
import { routes } from './api/routes'
import { MongoDB } from './databases/mongodb/mongodb'
import { logger } from './modules/Logger/Logger'
import { Nodemailer } from './modules/Nodemailer/Nodemailer'
import { Vault } from './modules/Vault/Vault'

const mongodbUri = 'mongodb://localhost:27017/test'

const optionsMongoDB = {
  useMongoClient: true,
  socketTimeoutMS: 0,
  keepAlive: true,
  reconnectTries: 30,
  promiseLibrary: Promise
}

const optionsVault = {
  token: 'goldfish',
  endpoint: 'http://0.0.0.0:8200',
  apiVersion: 'v1'
}

const optionsNodemailer = {
  apiKey: '_vQfC8b2lB_o13EyE2I4UA'
}

const main = async () => {
  try {
    Vault.config(optionsVault)
    Nodemailer.config(optionsNodemailer)

    const mongoDB = new MongoDB(mongodbUri, optionsMongoDB)
    await mongoDB.start()
    const app = new Koa()

    app
      .use(bodyParser())
      .use(
        views(__dirname + '/views', {
          extension: 'hbs',
          map: {
            hbs: 'handlebars'
          }
        })
      )
      .use(routes.routes())
      .use(routes.allowedMethods())

    app.listen(3000)
  } catch (e) {
    logger.log('error', e)
  }
}

main()
