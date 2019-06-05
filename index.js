require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(bodyParser.json())

morgan.token('body', (request, response) => JSON.stringify(request.body))
app.use(morgan('tiny', {
    skip: (req, res) => req.method === 'POST'
}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
    skip: (req, res) => req.method !== 'POST'
}))

// Routes
// Api root
app.get('/api', (request, response) => {
    response.send(`<h1>Api root, use <a href="/api/persons">/api/persons</a> for resources</h1>`)
})

// Get all
app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons.map(person => person.toJSON()))
    })
    .catch(error => next(error))
})

// Get one
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person){
        response.json(person.toJSON())
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})

// Create one
app.post('/api/persons', (request, response, next) => {
    const body = request.body

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(savedPerson => {
        response.json(savedPerson.toJSON())
    })
    .catch(error => next(error))

})

// Put update
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updated => {
            response.json(updated.toJSON())
        })
        .catch(error => next(error))
})

// Delete one
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
    })
    .catch(error => next(error))
})

// info page
app.get('/info', (request, response, next) => {
    Person.countDocuments({})
        .then(result => {
            response.send(`<div>Phonebook has ${result} persons info</div>
            <br/><div>${new Date()}</div>`)
    })
    .catch(error => next(error))
})

// unknown endpoint
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return response.status(400).send({ error: 'bad id'})
    } else if (error.name === 'ValidationError'){
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
app.use(errorHandler)

// listen
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
