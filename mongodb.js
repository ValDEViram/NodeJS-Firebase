import { MongoClient } from 'mongodb'
import 'dotenv/config'

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true
})

let db

export const connectDB = async () => {
  if (!db) {
    await client.connect()
    db = client.db()
    console.log('Conectado a MongoDB')
  }
  return db
}
