import { userRepository } from '../models/users.js'
import { productRepository } from '../models/products.js'
import express from 'express'

const router = express.Router()

router.post('/addProductsUser', async (req, res) => {
  const { id, productos } = req.body
  try {
    await userRepository.addProducts({ id, productos })
    res.status(201).send(`Se agregaron correctamente los productos: ${productos} al usuario: ${id}`)
  } catch (error) {
    res.status(500).json({ 'Error al actualizar el usuario': error })
  }
})

router.post('/addProduct', async (req, res) => {
  const { productName, marca, cantidad, precio, categoria, imgSource } = req.body

  try {
    await productRepository.addProduct({ productName, marca, cantidad, precio, categoria, imgSource })
    res.status(201).send('Se agrego el producto correctamente', productName, marca, cantidad, precio)
  } catch (error) {
    res.status(500).json({ 'Error al subir producto ': error })
  }
})

router.get(('/products'), async (req, res) => {
  try {
    const products = await productRepository.getProducts()
    res.status(201).send(products)
  } catch (error) {
    res.status(500).json({ 'Error al conseguir los productos': error })
  }
})

router.get(('/categories'), async (req, res) => {
  try {
    const categories = await productRepository.getCategories()
    res.status(201).send(categories)
  } catch (error) {
    res.status(500).json({ 'Error al conseguir los productos': error })
  }
})

export default router
