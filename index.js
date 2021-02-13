/* eslint-disable no-unused-vars */

require("dotenv").config();
const { response } = require("express");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const morgan = require("morgan");
const Person = require("./models/person");


morgan.token("content", function (req, res) { 
  return JSON.stringify(req.body); });

const logger = morgan(":method :url :status :res[content-length] - :response-time ms :content",
  {
    skip: (req,res) => {
      return req.method !== "POST";}
  });
app.use(cors());
app.use(express.static("build"));
app.use(express.json());
//app.use(logger);





app.get("/api/persons",(req,res)  => {
  Person.find({}).then(result => {
    res.json(result);
  });
});
app.get("/api/persons/:id", (req,res,next) => {
  Person.findById(req.params.id)
    .then(per => {
      if (per) {
        res.json(per);
      }
      else {
        res.status(404).end();
      }
    })
    .catch(err => next(err));
});

app.get("/info",(req,res) => {
  Person.countDocuments({}, (err,count) => {
    const strtosen = `<p>Phonebook has info of ${count} people
    </p> ${new Date().toString()}`;
    res.send(strtosen);
  });
}
);
//after deletion no changses in front end
app.delete("/api/persons/:id", (req,res,next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end();
    })
    .catch(err => next(err));
});

app.post("/api/persons" , (req,res,next) => {
  const body = req.body;
  if (!body||!body.name || !body.number) {
    return res.status(400).json({ 
      error: "content missing" 
    });
  }

  const person = new Person({
    name:body.name,
    number:body.number,
  });

  person.save().then(per => {
    res.json(per);
  })
    .catch((err) => next(err));

});

app.put("/api/persons/:id" , (req,res,next) => {
  const body = req.body;
  const id = body.id;
  const person = {
  //name:body.name,
    number:body.number,
  };
  Person.findByIdAndUpdate(id,person,{new:true,runValidators:true})
    .then(updatedPerson =>  {
      if (!updatedPerson) res.status(400).json({ error: "notPresent"});//in case person not pres
      else res.json(updatedPerson);})
    .catch(err => {
      next(err);});
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);


const errorHandler = (error, req, res, next) => {
  console.error(error.message);
  console.log(error.name);
  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  }
  
  else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message});
  }

  next(error);
};

app.use(errorHandler);
app.use(logger);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", function() {
  mongoose.connection.close(function () {
    console.log("Mongoose disconnected on app termination");
    process.exit(0);
  });
});