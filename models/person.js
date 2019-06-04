const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)

const URL = process.env.MONGODB_URI

console.log('Connectin to', URL)

mongoose.connect(URL, { useNewUrlParser: true })
    .then(result => {
        console.log('Connected to MongoDB')
})
.catch((error) => {
    console.log('Error connecting to MongoDB', error.message)
})

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)