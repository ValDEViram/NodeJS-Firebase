import { hash, compare } from 'bcrypt'
import { db } from '../firebase.js' // Corrige la importación
import admin from 'firebase-admin' // Importar admin

export class userRepository {
  static async createUser (userData) {
    try {
      const existingUserRef = await db.collection('users')
        .where('email', '==', userData.email)
        .get()

      // Si existe al menos un documento con ese correo
      if (!existingUserRef.empty) {
        throw new Error('El usuario ya existe con ese correo electrónico')
      }

      const userRef = db.collection('users').doc()
      const hashPassword = await hash(userData.password, 10) // Espera al hash

      await userRef.set({
        id: crypto.randomUUID(), // ID del documento generado
        email: userData.email, // Email pasado en userData
        username: userData.username, // Username pasado en userData
        password: hashPassword, // Contraseña cifrada
        creationDate: admin.firestore.Timestamp.now() // Fecha de creación
      })
      console.log('Usuario creado en Firestore con ID: ', userRef.id)
    } catch (error) {
      console.error('Error creando usuario en Firestore:', error)
      throw new Error(error.message || 'Error al crear el usuario') // Asegúrate de lanzar un mensaje específico
    }
  }

  static async loginUser (userData) {
    try {
      // Verificar si el usuario existe
      const existingUserRef = await db.collection('users')
        .where('email', '==', userData.email)
        .get()

      // Si no se encuentra ningún documento con ese correo
      if (existingUserRef.empty) {
        throw new Error('El correo no ha sido registrado')
      }

      // Obtener el documento del usuario
      const userDoc = existingUserRef.docs[0].data() // Obtener los datos del primer documento encontrado
      const storedPassword = userDoc.password // Obtener la contraseña almacenada

      // Comparar la contraseña proporcionada con la almacenada
      const isPasswordValid = await compare(userData.password, storedPassword)
      if (!isPasswordValid) {
        throw new Error('Contraseña incorrecta')
      }

      // Aquí puedes generar un token o devolver el usuario como respuesta
      // Ejemplo: return { message: 'Inicio de sesión exitoso', user: userDoc };

      return { message: 'Inicio de sesión exitoso', user: userDoc } // Devuelve el usuario encontrado
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error)
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  }

  static async getUsers () {
    try {
      const usersRef = db.collection('users')
      const snapshot = await usersRef.get() // Obtiene todos los documentos

      if (snapshot.empty) {
        console.log('No se encontraron usuarios')
        return []
      }

      const users = []
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() }) // Añade los datos de cada documento al array
      })

      return users
    } catch (error) {
      console.error('Error obteniendo usuarios:', error)
      throw error
    }
  }

  static async addProducts (userData) {
    try {
      const userQuerySnapshot = await db.collection('users')
        .where('id', '==', userData.id)
        .get() // Obtener la referencia al documento del usuario

      if (userQuerySnapshot.empty) {
        throw new Error('No existe el usuario')
      }

      // Suponiendo que solo hay un documento que coincide
      const userDoc = userQuerySnapshot.docs[0] // Obtener el primer documento

      // Obtener los productos existentes
      const existingProducts = userDoc.data().products || []

      // Combinar productos existentes con los nuevos
      const updatedProducts = [...existingProducts, ...userData.productos]

      // Actualizar los productos del usuario
      await userDoc.ref.update({ products: updatedProducts })

      console.log('Productos agregados al usuario: ', userData.id, '\n Productos: ', updatedProducts)
    } catch (error) {
      console.error('Error creando usuario en Firestore:', error)
      throw new Error(error.message || 'Error al crear el usuario') // Asegúrate de lanzar un mensaje específico
    }
  }
}
