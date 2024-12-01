// import express from 'express'
// import multer from 'multer'
// import { storage } from '../firebase.js' // Importa el almacenamiento configurado

// const router = express.Router()

// // Setting up multer as middleware to handle file uploads
// const upload = multer({ storage: multer.memoryStorage() })

// router.post('/', upload.single('filename'), async (req, res) => {
//   try {
//     const dateTime = giveCurrentDateTime()
//     const fileName = `${req.file.originalname}_${dateTime}`

//     const file = storage.file(`files/${fileName}`)

//     // Configuramos metadatos
//     const metadata = { contentType: req.file.mimetype }

//     // Subimos el archivo con un stream de buffer
//     const stream = file.createWriteStream({ metadata })
//     stream.end(req.file.buffer)

//     stream.on('finish', async () => {
//       const downloadURL = `https://storage.googleapis.com/${storage.name}/files/${fileName}`
//       console.log('File successfully uploaded.')
//       return res.send({
//         message: 'File uploaded to Firebase Storage',
//         name: req.file.originalname,
//         type: req.file.mimetype,
//         downloadURL
//       })
//     })

//     stream.on('error', (error) => {
//       console.error('Upload error:', error)
//       return res.status(500).send('Upload error')
//     })
//   } catch (error) {
//     return res.status(400).send(error.message)
//   }
// })

// // Helper function to format date and time
// const giveCurrentDateTime = () => {
//   const today = new Date()
//   const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
//   const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
//   return `${date} ${time}`
// }

// export default router
