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

router.patch('/editProduct/:id', async (req, res) => {
  const { id } = req.params
  const { product, brand, quantity, price, category, stock, offer, imgName } = req.body

  console.log('Actualizando producto con ID:', id)
  console.log('Datos recibidos:', req.body)

  try {
    const updatedProduct = await productRepository.editProduct({ id, product, brand, quantity, price, category, stock, offer, imgName })

    if (updatedProduct) {
      res.status(200).send('Producto editado correctamente :)')
    } else {
      res.status(404).send('Producto no encontrado')
    }
  } catch (error) {
    console.error('Error al actualizar el producto:', error)
    res.status(500).json({ 'Error al actualizar el producto': error })
  }
})

router.post('/addProduct', async (req, res) => {
  const { productName, brand, quantity, price, category, stock, offer, imgName } = req.body

  try {
    await productRepository.addProduct({ productName, brand, quantity, price, category, stock, offer, imgName })
    res.status(201).send('Se agrego el producto correctamente', productName, brand, quantity, price)
  } catch (error) {
    res.status(500).json({ 'Error al subir producto ': error })
  }
})

router.post('/addCategory', async (req, res) => {
  const { category, imgURL } = req.body

  try {
    await productRepository.addCategory({ category, imgURL })
    res.status(201).send('Se agrego la categoria correctamente', category, imgURL)
  } catch (error) {
    res.status(500).json({ 'Error al registrar la categoria ': error })
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

router.get('/products/:ID', async (req, res) => {
  const { ID } = req.params
  try {
    const product = await productRepository.getProductByID(ID)
    if (product) {
      res.status(200).send(product)
    } else {
      res.status(404).send({ message: 'Producto no encontrado' })
    }
  } catch (error) {
    res.status(500).json({ 'Error al conseguir el producto': error })
  }
})

router.get('/getProductByCategory/:category', async (req, res) => {
  const { category } = req.params
  try {
    const product = await productRepository.getProductByCategory(category)
    if (product) {
      res.status(200).send(product)
    } else {
      res.status(404).send({ message: 'Producto no encontrado' })
    }
  } catch (error) {
    res.status(500).json({ 'Error al conseguir el producto': error })
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
