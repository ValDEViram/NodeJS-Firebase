import { hash, compare } from 'bcrypt'
import { db } from '../firebase.js'
import admin from 'firebase-admin'
import nodemailer from 'nodemailer'
import 'dotenv/config'
import jwt from 'jsonwebtoken'

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
