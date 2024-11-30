import { MongoClient } from 'mongodb'
import 'dotenv/config'

const uri = process.env.MONGODB_URI // La URI completa con la base de datos incluida
const client = new MongoClient(uri)
let db

export const connectDB = async () => {
  if (!db) {
    await client.connect()
    db = client.db() // No necesitas pasar dbName, ya lo toma de la URI
    console.log('Conectado a MongoDB')
  }
  return db
}
