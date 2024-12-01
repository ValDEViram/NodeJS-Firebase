// import { db } from '../firebase.js'

// export class productRepository {
//   static async addProduct (product) {
//     const productRef = db.collection('products').doc()

//     await productRef.set({
//       id: crypto.randomUUID(),
//       product: product.productName,
//       brand: product.brand,
//       quantity: product.quantity,
//       price: product.price,
//       category: product.category,
//       stock: product.stock,
//       offer: product.offer,
//       fetchName: product.fetchName,
//       imgName: product.imgName
//     })
//   }

//   static async addCategory ({ category, imgURL }) {
//     const categoryRef = db.collection('categories').doc()

//     await categoryRef.set({
//       id: crypto.randomUUID(),
//       category,
//       imgURL
//     })
//   }

//   static async editProduct (product) {
//     const productsRef = db.collection('products')

//     if (!product.id) {
//       throw new Error('El ID del producto es requerido para la actualización')
//     }

//     const snapshot = await productsRef.where('id', '==', product.id).get()
//     if (snapshot.empty) {
//       console.log('No se encontró el producto con el ID especificado')
//       return null
//     }

//     const productDoc = snapshot.docs[0].ref
//     const updateData = {
//       product: product.product,
//       brand: product.brand,
//       quantity: product.quantity,
//       price: product.price,
//       category: product.category,
//       imgName: product.imgName
//     }

//     if (product.stock !== undefined) updateData.stock = product.stock
//     if (product.offer !== undefined) updateData.offer = product.offer
//     if (product.fetchName !== undefined) updateData.fetchName = product.fetchName

//     await productDoc.update(updateData)
//     return { id: product.id, ...product }
//   }

//   static async getProducts () {
//     const productsRef = db.collection('products')
//     const snapshot = await productsRef.get()

//     if (snapshot.empty) {
//       console.log('No se encontraron productos')
//       return []
//     }

//     const products = []
//     snapshot.forEach((product) => {
//       products.push({ id: product.id, ...product.data() })
//     })

//     return products
//   }

//   static async getProductByID (ID) {
//     const productsRef = db.collection('products')
//     const snapshot = await productsRef.where('id', '==', ID).get()

//     if (snapshot.empty) {
//       throw new Error('No se encontro el producto con el ID especificado')
//     }

//     // Si el snapshot no está vacío, obtenemos el primer documento que coincide
//     const productData = snapshot.docs[0].data()
//     return productData
//   }

//   static async getProductsByChar (character) {
//     if (!character || character.trim() === '') {
//       throw new Error('El parámetro de búsqueda no puede estar vacío')
//     }

//     const productsRef = db.collection('products')

//     // Realizamos la consulta solo si 'character' es válido
//     const snapshot = await productsRef
//       .orderBy('product')
//       .startAt(character)
//       .endAt(character + '\uf8ff')
//       .get()

//     if (snapshot.empty) {
//       throw new Error('No se encontraron productos que coincidan con la búsqueda')
//     }

//     // Si hay resultados, los devolvemos
//     const products = snapshot.docs.map(doc => doc.data())
//     return products
//   }

//   static async getProductByCategory (category) {
//     const productsRef = db.collection('products')
//     const snapshot = await productsRef.where('category', '==', category).get()

//     if (snapshot.empty) {
//       throw new Error('No se encontraron productos con esa categoría')
//     }
//     const productData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
//     return productData
//   }

//   static async getCategories () {
//     const categoriesRef = db.collection('categories')
//     const snapshot = await categoriesRef.get()

//     if (snapshot.empty) {
//       console.log('No se encontraron productos')
//       return []
//     }

//     const categories = []
//     snapshot.forEach((product) => (
//       categories.push({ id: product.id, ...product.data() })
//     ))

//     return categories
//   }
// }
