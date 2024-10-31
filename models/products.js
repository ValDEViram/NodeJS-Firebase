import { db } from '../firebase.js'

export class productRepository {
  static async addProduct (product) {
    const productRef = db.collection('products').doc()

    await productRef.set({
      id: crypto.randomUUID(),
      product: product.productName,
      brand: product.marca,
      quantity: product.cantidad,
      price: product.precio,
      category: product.categoria,
      imgURL: product.imgSource
    })
  }

  static async getProducts () {
    const productsRef = db.collection('products')
    const snapshot = await productsRef.get()

    if (snapshot.empty) {
      console.log('No se encontraron productos')
      return []
    }

    const products = []
    snapshot.forEach((product) => {
      products.push({ id: product.id, ...product.data() })
    })

    return products
  }

  static async getCategories () {
    const productsRef = db.collection('products')
    const snapshot = await productsRef.get()

    if (snapshot.empty) {
      console.log('No se encontraron productos')
      return []
    }

    const categories = new Set()
    snapshot.forEach((product) => {
      categories.add(product.data().category)
    })

    return Array.from(categories)
  }
}
