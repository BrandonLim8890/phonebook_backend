const http = require('http')
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

morgan.token('body', (req) => {
	return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

let persons = [
	{
		id: 1,
		name: 'Arto Hellas',
		number: '040-123456'
	},
	{
		id: 2,
		name: 'Ada Lovelace',
		number: '39-44-5323523'
	},
	{
		id: 3,
		name: 'Dan Abramov',
		number: '12-42-234345'
	},
	{
		id: 4,
		name: 'Mary Poppendick',
		number: '39-23-6423122'
	}
]

app.get(`/api/persons/:id`, (req, res) => {
	const id = Number(req.params.id)
	const person = persons.find((person) => person.id === id)

	if (person) {
		res.json(person)
	} else {
		res.status(404).end()
	}
})

app.delete(`/api/persons/:id`, (req, res) => {
	const id = Number(req.params.id)
	persons = persons.filter((person) => person.id !== id)
	res.status(204).end()
})

app.get(`/api/persons`, (req, res) => {
	res.json(persons)
})

app.get(`/info`, (req, res) => {
	res.send(`<h1>Phonebook has info for ${persons.length} people</h1>
  <p>${new Date()}</p>
  `)
})

app.post(`/api/persons`, (req, res) => {
	const id = Math.floor(Math.random() * 1000)
	const body = req.body

	if (!body.name) {
		return res.status(400).json({ error: 'name missing' })
	} else if (!body.number) {
		return res.status(400).json({ error: 'number missing' })
	} else if (persons.filter((person) => person.name.toLowerCase() === body.name.toLowerCase()).length > 0) {
		// Filters through array to find existing name
		// If name exists, it will return an array of length > 0
		return res.status(400).json({ error: 'name must be unique' })
	}

	const person = {
		id: id,
		name: body.name,
		number: body.number
	}

	persons = persons.concat(person)

	res.json(person)
})

app.put(`/api/persons/:id`, (req, res) => {
	const newPerson = req.body
	persons = persons.map((person) => (person.name === newPerson.name ? newPerson : person))
	res.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
