require('dotenv').config()
const http = require('http')
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const { response } = require('express')

morgan.token('body', (req) => {
	return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

app.get(`/api/persons/:id`, (req, res) => {
	Person.findById(req.params.id)
		.then((person) => {
			res.json(person)
		})
		.catch((err) => next(err))
})

app.delete(`/api/persons/:id`, (req, res) => {
	Person.findByIdAndDelete(req.params.id)
		.then(() => {
			res.status(204).end()
		})
		.catch((err) => next(err))
})

app.get(`/api/persons`, (req, res) => {
	Person.find({}).then((persons) => {
		res.json(persons)
	})
})

app.get(`/info`, (req, res) => {
	Person.find({}).then((persons) => {
		res.send(`<h1>Phonebook has info for ${persons.length} people</h1>
  <p>${new Date()}</p>`)
	})
})

app.post(`/api/persons`, (req, res, next) => {
	const body = req.body

	if (!body.name) {
		return res.status(400).json({ error: 'name missing' })
	} else if (!body.number) {
		return res.status(400).json({ error: 'number missing' })
	} else {
		Person.find({ name: body.name }).then((person) => {
			const newPerson = new Person({
				name: body.name,
				number: body.number
			})
			newPerson
				.save()
				.then((result) => {
					res.json(result)
				})
				.catch((err) => {
					next(err)
				})
		})
	}
})

app.put(`/api/persons/:id`, (req, res) => {
	const newPerson = req.body
	Person.findByIdAndUpdate(newPerson.id, newPerson).then((result) => {
		res.status(204).end()
	})
})

const errorHandler = (err, req, res, next) => {
	console.error(err.message)

	if (err.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	}
	next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
