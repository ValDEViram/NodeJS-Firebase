import { MongoClient } from 'mongodb'
import 'dotenv/config' // Cargar las variables de entorno de .env

// Usar las variables de entorno para URI y nombre de la base de datos
const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME

const client = new MongoClient(uri)
let db

export const connectDB = async () => {
  if (!db) {
    await client.connect()
    db = client.db(dbName)
    console.log('Conectado a MongoDB')
  }
  return db
}
