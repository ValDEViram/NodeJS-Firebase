import { db } from '../firebase.js'
import { userRepository } from '../models/users.js'
import express from 'express'
import 'dotenv/config'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/register', async (req, res) => {
  const { email, username, password } = req.body

  // Validar datos antes de seguir
  if (!email || !username || !password) {
    return res
      .status(400)
      .json({ message: 'Todos los campos son obligatorios' })
  }

  // Llamar a la función que guarda el usuario en Firestore
  try {
    await userRepository.createUser({ email, username, password })
    res.status(201).json({ message: 'Usuario creado exitosamente' })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creando el usuario', error })
  }
})

router.post('/sendVerification', async (req, res) => {
  const { email, code } = req.body

  if (!email || !code) throw new Error('Tanto el codigo como el correo son requeridos')

  try {
    const userSnapshot = await db.collection('users')
      .where('email', '==', email)
      .where('regCode', '==', parseInt(code))
      .get()

    if (userSnapshot.empty) {
      return res.staturs(400).json({ message: 'Codigo de verificación incorrecto' })
    }

    const userRef = userSnapshot.docs[0]?.ref

    if (!userRef) {
      return res.status(400).json({ message: 'No se encontró el usuario' })
    }
    await userRef.update({ validatedAccount: true, regCode: null })

    res.status(200).json({ message: 'Cuenta verificada exitosamente' })
  } catch (error) {
    console.error('Error verificando cuenta:', error)
    res.status(500).json({ message: 'Error al verificar la cuenta' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Todos los campos son obligatorios' })
  }

  try {
    const { message, token } = await userRepository.loginUser({ email, password })

    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000
    })

    res.status(200).json({ message })
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error durante el inicio de sesión' })
  }
})

router.get('/getUsers', async (req, res) => {
  const users = await userRepository.getUsers()
  try {
    res.status(201).send(users)
  } catch (error) {
    res.status(500).json({ message: 'Error al conseguir los usuarios', error })
  }
})

router.get('/status', (req, res) => {
  const token = req.cookies['auth-token']
  if (!token) {
    return res.status(401).json({ authenticated: false })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    res.status(200).json({ authenticated: true, user: decoded })
  } catch (error) {
    res.status(401).json({ authenticated: false })
  }
})

export default router
