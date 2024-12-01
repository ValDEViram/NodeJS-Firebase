import { connectDB } from '../mongodb.js'

export class productRepository {
  static async addProduct (product) {
    const db = await connectDB()
    const productData = ({
      id: crypto.randomUUID(),
      product: product.productName,
      brand: product.brand,
      quantity: product.quantity,
      price: product.price,
      category: product.category,
      stock: product.stock,
      offer: product.offer,
      fetchName: product.fetchName,
      imgName: product.imgName
    })
    await db.collection('products').insertOne(productData)
    return productData
  }

  static async addCategory ({ category, imgURL }) {
    const db = await connectDB()
    const categoryData = ({
      id: crypto.randomUUID(),
      category,
      imgURL
    })
    await db.collection('categories').insertOne(categoryData)
    return categoryData
  }

  static async editProduct (product) {
    const db = await connectDB()

    const updateData = {
      product: product.product,
      brand: product.brand,
      quantity: product.quantity,
      price: product.price,
      category: product.category,
      imgName: product.imgName
    }

    if (product.stock !== undefined) updateData.stock = product.stock
    if (product.offer !== undefined) updateData.offer = product.offer
    if (product.fetchName !== undefined) updateData.fetchName = product.fetchName

    try {
      const result = await db.collection('products').findOneAndUpdate(
        { _id: product.id },
        { $set: updateData },
        { returnDocument: 'after' }
      )

      return result
    } catch (error) {
      console.error('Error al actualizar el producto:', error)
      throw new Error('Error en la base de datos')
    }
  }

  static async getProducts () {
    const db = await connectDB()
    const products = await db.collection('products').find().toArray()
    return products
  }

  static async getProductByID (ID) {
    const db = await connectDB()
    const product = await db.collection('products').findOne({ id: ID })
    if (!product) throw new Error('El producto no existe en la base de datos')
    return product
  }

  static async getProductsByChar (character) {
    if (!character || character.trim() === '') {
      throw new Error('El parámetro de búsqueda no puede estar vacío')
    }
    const db = await connectDB()

    const products = await db.collection('products').find({
      product: { $regex: character, $options: 'i' }
    }).toArray()
    if (products.length === 0) throw new Error('No se encontraron productos que coincidan con la busqueda')
    return products
  }

  static async getProductByCategory (category) {
    const db = await connectDB()
    const products = await db.collection('products').find({ category }).toArray()
    if (!products) throw new Error('No se encontro ningun producto con esa categoria')
    return products
  }

  static async getCategories () {
    const db = await connectDB()
    const categories = await db.collection('categories').find().toArray()
    if (!categories.length) {
      throw new Error('No se encontraron categorías')
    }
    return categories
  }
}
