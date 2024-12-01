import { hash, compare } from 'bcrypt'
import { connectDB } from '../mongodb.js'
import nodemailer from 'nodemailer'
import 'dotenv/config'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { productRepository } from './products.js'

export class userRepository {
  static async createUser (userData) {
    try {
      const db = await connectDB()
      const usersCollection = db.collection('users')

      // Verificar si el usuario ya existe
      const existingUser = await usersCollection.findOne({ email: userData.email })
      if (existingUser) {
        throw new Error('El usuario ya existe con ese correo electrónico')
      }

      const hashPassword = await hash(userData.password, 10)
      const regCode = Math.floor(100000 + Math.random() * 9000)

      await this.sendVerificationEmail(userData.email, regCode)

      const user = {
        id: crypto.randomUUID(),
        email: userData.email,
        username: userData.username,
        password: hashPassword,
        regCode,
        validatedAccount: false,
        creationDate: new Date()
      }

      // Insertar el nuevo usuario en MongoDB
      await usersCollection.insertOne(user)

      console.log('Usuario creado con ID: ', user.id)
    } catch (error) {
      console.error('Error creando usuario en MongoDB:', error)
      throw new Error(error.message || 'Error al crear el usuario')
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
      const db = await connectDB()
      const usersCollection = db.collection('users')

      // Verificar si el usuario existe
      const user = await usersCollection.findOne({ email: userData.email })
      if (!user) {
        throw new Error('El correo no ha sido registrado')
      }

      if (!user.validatedAccount) {
        throw new Error('La cuenta no ha sido validada. Por favor, verifica tu correo electrónico.')
      }

      // Comparar la contraseña proporcionada con la almacenada
      const isPasswordValid = await compare(userData.password, user.password)
      if (!isPasswordValid) {
        throw new Error('Contraseña incorrecta')
      }

      const token = jwt.sign(
        { userID: user.id, email: user.email },
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
      const db = await connectDB()
      const usersCollection = db.collection('users')

      const users = await usersCollection.find().toArray()
      if (users.length === 0) {
        console.log('No se encontraron usuarios')
        return []
      }

      return users
    } catch (error) {
      console.error('Error obteniendo usuarios:', error)
      throw error
    }
  }

  static async addProducts ({ userID, productos }) {
    try {
      const db = await connectDB()
      const usersCollection = db.collection('users')

      const user = await usersCollection.findOne({ id: userID })
      if (!user) {
        throw new Error('No existe el usuario')
      }

      const updatedProducts = [...user.products]

      // Añadir productos al carrito
      for (const product of productos) {
        const existingProduct = await productRepository.getProductByID(product.productID)
        if (existingProduct.stock < product.amount) {
          throw new Error('Stock insuficiente para el producto')
        }

        existingProduct.stock -= product.amount
        await productRepository.editProduct(existingProduct)

        const index = updatedProducts.findIndex(p => p.productID === product.productID)
        if (index !== -1) {
          updatedProducts[index].amount += product.amount
        } else {
          updatedProducts.push(product)
        }
      }

      // Actualizar los productos del usuario
      await usersCollection.updateOne({ id: userID }, { $set: { products: updatedProducts } })

      console.log('Productos agregados al usuario: ', userID, '\n Productos: ', updatedProducts)
    } catch (error) {
      console.error('Error creando usuario en MongoDB:', error)
      throw new Error(error.message || 'Error al agregar productos al usuario')
    }
  }

  static async getProductsInCart ({ ID }) {
    try {
      const db = await connectDB()
      const usersCollection = db.collection('users')

      const user = await usersCollection.findOne({ id: ID })
      if (!user) {
        throw new Error('No existe el usuario')
      }

      return user.products
    } catch (error) {
      console.log('Error al obtener los productos guardados', error)
    }
  }

  static listenToCartUpdates ({ ID }, onUpdate) {
    const db = connectDB()
    const usersCollection = db.collection('users')

    // Escuchar cambios en tiempo real (MongoDB Change Streams)
    const changeStream = usersCollection.watch([{ $match: { 'fullDocument.id': ID } }])

    changeStream.on('change', async (change) => {
      const updatedUser = change.fullDocument
      const userProducts = updatedUser.products || []

      // Actualizar datos de cada producto en el carrito
      const updatedProducts = await Promise.all(
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

      onUpdate(updatedProducts)
    })

    // Devuelve la función para cancelar la suscripción si se necesita
    return () => changeStream.close()
  }
}
