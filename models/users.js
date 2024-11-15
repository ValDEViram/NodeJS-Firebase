import { hash, compare } from 'bcrypt'
import { db } from '../firebase.js'
import admin from 'firebase-admin'
import nodemailer from 'nodemailer'
import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { productRepository } from './products.js'

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
      const hashPassword = await hash(userData.password, 10)
      const regCode = Math.floor(100000 + Math.random() * 9000)

      await this.sendVerificationEmail(userData.email, regCode)

      await userRef.set({
        id: crypto.randomUUID(),
        email: userData.email,
        username: userData.username,
        password: hashPassword,
        regCode,
        validatedAccount: false,
        creationDate: admin.firestore.Timestamp.now()
      })

      console.log('Usuario creado en Firestore con ID: ', userRef.id)
    } catch (error) {
      console.error('Error creando usuario en Firestore:', error)
      throw new Error(error.message || 'Error al crear el usuario') // Asegúrate de lanzar un mensaje específico
    }
  }

  static async sendVerificationEmail (email, code) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Codigo de verificacion de cuenta',
      html: `
      <div style="padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #194860; text-align: center;">¡Bienvenido a SaboresBase!</h2>
          <p style="font-size: 16px;">Hola,</p>
          <p style="font-size: 16px;">Gracias por registrarte en nuestra plataforma. Para completar tu registro, por favor usa el siguiente código de verificación:</p>
          <div style="text-align: center; background-color: #f4f4f4; font-size: 24px; font-weight: bold; color: #194860; margin: 20px 0; border: 1px solid #13688b; box-shadow: 0px 5px 5px rgba(0,0,0, 0.1);">
            ${code}
          </div>
          <p style="font-size: 16px;">¡Esperamos que disfrutes de nuestra plataforma!</p>
          <p style="font-size: 16px; text-align: center;">El equipo de SaboresBase</p>
        </div>
      </div>
    `
    }

    try {
      await transporter.sendMail(mailOptions)
      console.log('Correo de verificación enviado')
    } catch (error) {
      console.error('Error enviando correo de verificación:', error)
      throw new Error('No se pudo enviar el correo de verificación')
    }
  }

  static async loginUser (userData) {
    try {
      // Verificar si el usuario existe
      const existingUserRef = await db.collection('users')
        .where('email', '==', userData.email)
        .get()

      if (existingUserRef.empty) {
        throw new Error('El correo no ha sido registrado')
      }

      const userDoc = existingUserRef.docs[0].data()
      const storedPassword = userDoc.password

      if (!userDoc.validatedAccount) {
        throw new Error('La cuenta no ha sido validada. Por favor, verifica tu correo electrónico.')
      }
      // Comparar la contraseña proporcionada con la almacenada
      const isPasswordValid = await compare(userData.password, storedPassword)
      if (!isPasswordValid) {
        throw new Error('Contraseña incorrecta')
      }

      const token = jwt.sign(
        { userID: userDoc.id, email: userDoc.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      return { message: 'Inicio de sesión exitoso', token }
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

  static async addProducts ({ id, productos }) {
    try {
      const userQuerySnapshot = await db.collection('users')
        .where('id', '==', id)
        .get() // Obtener la referencia al documento del usuario

      if (userQuerySnapshot.empty) {
        throw new Error('No existe el usuario')
      }

      const userDoc = userQuerySnapshot.docs[0] // Obtener el primer documento

      const existingProducts = userDoc.data().products || []

      const updatedProducts = [...existingProducts]
      productos.forEach((product) => {
        const index = existingProducts.findIndex(p => p.productID === product.productID)
        if (index !== -1) {
          updatedProducts[index].amount += product.amount
        } else {
          updatedProducts.push(product)
        }
      })

      // Actualizar los productos del usuario
      await userDoc.ref.update({ products: updatedProducts })

      console.log('Productos agregados al usuario: ', id, '\n Productos: ', updatedProducts)
    } catch (error) {
      console.error('Error creando usuario en Firestore:', error)
      throw new Error(error.message || 'Error al crear el usuario') // Asegúrate de lanzar un mensaje específico
    }
  }

  static async getProductsInCart ({ ID }) {
    try {
      const userQuerySnapshot = await db.collection('users')
        .where('id', '==', ID)
        .get()
      if (userQuerySnapshot.empty) {
        throw new Error('No existe el usuario')
      }

      const userDoc = userQuerySnapshot.docs[0]

      const userProducts = userDoc.data().products
      return userProducts
    } catch (error) {
      console.log('Erorr al obtener los productos guardados', error)
    }
  }

  static listenToCartUpdates ({ ID }, onUpdate) {
    const userQuery = db.collection('users').where('id', '==', ID)

    // Escuchar cambios en tiempo real en los productos del usuario
    const unsubscribe = userQuery.onSnapshot(async (snapshot) => {
      if (snapshot.empty) {
        console.error('No existe el usuario')
        return
      }

      const userDoc = snapshot.docs[0]
      let userProducts = userDoc.data().products || []

      // Actualizar datos de cada producto en el carrito
      userProducts = await Promise.all(
        userProducts.map(async (product) => {
          const storeProduct = await productRepository.getProductByID(product.productID)
          return {
            ...product,
            productName: storeProduct.productName,
            price: storeProduct.price,
            imgName: storeProduct.imgName
          }
        })
      )

      // Llama a la función onUpdate con los datos actualizados
      onUpdate(userProducts)
    })

    // Devuelve la función para cancelar la suscripción si se necesita
    return unsubscribe
  }
}
