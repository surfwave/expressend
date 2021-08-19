const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

morgan.token('body', req => {
    return JSON.stringify(req.body);
})

app.use(cors());
app.use(express.json());
app.use(morgan(`:method :url :status :res[content-length] - :response-time ms :body`))

let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
]

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date().toLocaleString()}</p>`)
})

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const person = persons.find(person => person.id === id);
    if (person) {
        res.json(person);
    } else {
        res.status(404).end();
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const found = persons.find(person => person.id ===id);
    if (found) {
        persons = persons.filter(person => person.id !== id);
        res.status(204).end();
    } else {
        res.status(404).end();
    }
})

const generateId = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max-min) + min)
}

app.post('/api/persons', (req, res) => {
    const body = req.body;
    if (!body.name) {
        return res.status(400).json({
            error: 'name missing'
        })
    }
    if (!body.number) {
        return res.status(400).json({
            error: 'number missing'
        })
    }
    const existed = persons.find(person => person.name === body.name);
    if (existed) {
        return res.status(404).json({
            error: 'person exists'
        })
    }
    const person = {
        name: body.name,
        number: body.number,
        id: generateId(1000000, 9999999),
    }

    persons = persons.concat(person);
    res.json(person);
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});