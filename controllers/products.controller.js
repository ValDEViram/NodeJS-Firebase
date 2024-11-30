import { userRepository } from '../models/users.js'
import { productRepository } from '../models/products.js'
import express from 'express'
import webPush from '../pushService.js'

const router = express.Router()

router.post('/addProductsUser', async (req, res) => {
  const { userID, productos } = req.body // `productos` debe ser un array de productos con detalles

  try {
    await userRepository.addProducts({ userID, productos })
    res.status(201).send(`Se agregaron correctamente los productos al usuario: ${userID}`)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el usuario', details: error.message })
  }
})

router.patch('/editProduct/:id', async (req, res) => {
  const { id } = req.params
  const { product, brand, quantity, price, category, stock, offer, fetchName, imgName } = req.body

  console.log('Actualizando producto con ID:', id)
  console.log('Datos recibidos:', req.body)

  try {
    const updatedProduct = await productRepository.editProduct({ id, product, brand, quantity, price, category, stock, offer, fetchName, imgName })

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
  const { productName, brand, quantity, price, category, stock, offer, fetchName, imgName } = req.body

  try {
    await productRepository.addProduct({ productName, brand, quantity, price, category, stock, offer, fetchName, imgName })
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

router.get('/products/search/:searchCharacters', async (req, res) => {
  const { searchCharacters } = req.params

  // Verificamos si 'searchCharacters' está presente y no es vacío
  if (!searchCharacters || searchCharacters.trim() === '') {
    return res.status(400).json({ message: 'El parámetro de búsqueda no puede estar vacío' })
  }

  try {
    const products = await productRepository.getProductsByChar(searchCharacters)

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No se encontraron productos que coincidan con la búsqueda' })
    }

    res.status(200).json(products)
  } catch (error) {
    console.error('Error al conseguir los productos:', error)
    res.status(500).json({ message: 'Error al conseguir los productos', error: error.toString() })
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

router.get('/getProducts/:category', async (req, res) => {
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

router.get('/categories', async (req, res) => {
  try {
    const categories = await productRepository.getCategories()
    res.status(201).send(categories)
  } catch (error) {
    console.error('Error al conseguir las categorías:', error) // Log detallado
    res.status(500).json({ message: 'Error al conseguir las categorías', error: error.message })
  }
})

router.get(('/user/getProducts/:ID'), async (req, res) => {
  const ID = req.params
  try {
    const userProducts = await userRepository.getProductsInCart(ID)
    res.status(210).send(userProducts)
  } catch (error) {
    res.status(500).json({ 'Error al conseguir los productos guardados del usuario': error })
  }
})

// Simularemos una base de datos
const subscriptions = []

// Endpoint para guardar suscripción
router.post('/subscribe', (req, res) => {
  const subscription = req.body

  // Validar la suscripción
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Suscripción inválida' })
  }

  // Guardar la suscripción en la base de datos simulada
  subscriptions.push(subscription)
  console.log('Nueva suscripción:', subscription)

  res.status(201).json({ message: 'Suscripción guardada' })
})

router.post('/send-notification', async (req, res) => {
  const payload = JSON.stringify({
    title: 'Tu pedido está en camino',
    body: '¡Tu pedido llegará pronto! Gracias por comprar con nosotros.',
    icon: '/assets/icons/icon-192x192.png',
    data: { url: '/shoping-cart' },
    actions: [
      { action: 'open', title: 'Abrir App' },
      { action: 'close', title: 'Cerrar Notificación' }
    ]
  })

  // Enviar notificaciones a todas las suscripciones almacenadas
  const sendNotifications = subscriptions.map((subscription) =>
    webPush.sendNotification(subscription, payload).catch((error) => {
      console.error('Error al enviar notificación:', error)
    })
  )

  try {
    await Promise.all(sendNotifications)
    res.status(200).json({ message: 'Notificaciones enviadas' })
  } catch (error) {
    console.error('Error al enviar notificaciones:', error)
    res.sendStatus(500)
  }
})

export default router
