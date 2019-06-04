const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

morgan.token('body', (request, response) => JSON.stringify(request.body))

app.use(bodyParser.json())
app.use(morgan('tiny', {
    skip: (req, res) => req.method === 'POST'
}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
    skip: (req, res) => req.method !== 'POST'
}))
app.use(cors())
app.use(express.static('build'))

// harcoded data
let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123478"
    },
    {
        id: 2,
        name: "Arto Järvinen",
        number: "040-123478"
    },
    {
        id: 3,
        name: "Lea Kutvonen",
        number: "040-123478"
    },
    {
        id: 4,
        name: "Martti Tienari",
        number: "040-123478"
    }
]

// Routes
// Root page
app.get('/', (request, response) => {
    response.send(`<h1>Root page,
                       use <a href="/api">/api</a> for api,
                       <a href="/api/persons">/api/persons</a> for resources
                       or <a href="/info">/info</a> for infopage</h1>`)
})

// Api root
app.get('/api', (request, response) => {
    response.send(`<h1>Api root, use <a href="/api/persons">/api/persons</a> for resources</h1>`)
})

// Get all
app.get('/api/persons', (request, response) => {
    response.json(persons)
})

// Get one
app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person){
        response.json(person)
    } else {
        response.status(404).end()
    }
})

// id
const generateId = () => {
    return  Math.floor(Math.random() * Math.floor(1000))
}

// Create one
app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    if (persons.find(person => person.name === body.name)){
        return response.status(400).json({
            error: 'person already exists, name must be unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)
    response.json(person)

})

// Delete one
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

// info page
app.get('/info', (request, response) => {
    response.send(`<div>Phonebook has ${persons.length} persons info</div>
                   <br/><div>${new Date()}</div>`)
})

// unknown endpoint
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// listen
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
