import { userRepository } from '../models/users.js'
import express from 'express'

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

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  // Validar datos antes de seguir
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Todos los campos son obligatorios' })
  }

  // Llamar a la función que guarda el usuario en Firestore
  try {
    await userRepository.loginUser({ email, password })
    res.status(201).json({ email, password })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creando el usuario', error })
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

export default router
