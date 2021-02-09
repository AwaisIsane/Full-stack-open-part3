const { response } = require('express');
const express = require('express');
const cors = require('cors')

const app = express();

const morgan = require('morgan');

morgan.token('content', function (req, res) { 
  return JSON.stringify(req.body) })

const logger = morgan(':method :url :status :res[content-length] - :response-time ms :content',
{
  skip: (req,res) => {
    return req.method !== "POST"}
});
app.use(cors())

app.use(logger);


app.use(express.json());

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
      }
    
]

app.get("/api/persons",(req,res)  => {
    res.json(persons)
})

app.get("/api/persons/:id", (req,res) => {
  const id = Number(req.params.id);
  const person =  persons.find(per =>per.id===id)

  if (person) {
    res.json(person)
    }
    else {
      res.status(404).end()
    }
})


app.get("/info",(req,res) => {
    const strtosen = `<p>Phonebook has info of ${persons.length} people
    </p> ${new Date().toString()}`
    res.send(strtosen)
}
)

app.delete("/api/persons/:id", (req,res) => {
  const id = Number(req.params.id)
  persons = persons.filter(per => per.id !== id)
  res.status(204).end()
})

const genrateId = () => {
  return  Math.floor(Math.random() * Math.floor(10000));

}
app.post("/api/persons" , (req,res) => {
  const body = req.body
  if (!body||!body.name || !body.number) {
    return res.status(400).json({ 
      error: 'content missing' 
    })
  }

  if (persons.filter(per => per.name===body.name).length!==0) {
    return res.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const per = {
    name:body.name,
    number:body.number,
    id:genrateId(),
  }
  persons = persons.concat(per)
  res.json(per)
})

const PORT = process.env.port || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})