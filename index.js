require('dotenv').config()
const { response } = require('express');
const express = require('express');
const cors = require('cors')
const mongoose = require('mongoose')
const app = express();
const morgan = require('morgan');
const Person = require("./models/person")


morgan.token('content', function (req, res) { 
  return JSON.stringify(req.body) })

const logger = morgan(':method :url :status :res[content-length] - :response-time ms :content',
{
  skip: (req,res) => {
    return req.method !== "POST"}
});
app.use(cors())
app.use(express.static('build'))
app.use(logger);


app.use(express.json());


app.get("/api/persons",(req,res)  => {
    Person.find({}).then(result => {
    console.log("phonebook:")
    result.forEach(note => {
    console.log(`${note.name} ${note.number}`)
    })
    res.json(result)


  })
})

app.get("/api/persons/:id", (req,res) => {
  Person.findById(req.params.id)
  .then(per => {
    res.json(per)
  }
  )
  .catch(err => {
    res.status(404).end()
    console.log("err",err)})
})

app.get("/info",(req,res) => {
    const strtosen = `<p>Phonebook has info of ${persons.length} people
    </p> ${new Date().toString()}`
    res.send(strtosen)
}
)

app.delete("/api/persons/:id", (req,res) => {
  Person.deleteOne({id:req.params.id})
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
/*
  if (persons.filter(per => per.name===body.name).length!==0) {
    return res.status(400).json({ 
      error: 'name must be unique' 
    })
  }
*/
  const person = new Person({
    name:body.name,
    number:body.number,
  })

  person.save().then(per => {
    console.log(`added ${per.name} number ${per.number} to phonebook`)
    res.json(per)
  })

})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected on app termination');
    process.exit(0);
  });
});