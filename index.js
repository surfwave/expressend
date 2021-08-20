require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const Person = require("./models/person");

// const cors = require('cors');
const app = express();

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  if (error.name === "CastError" && error.kind === "ObjectId") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

// app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(
  morgan(`:method :url :status :res[content-length] - :response-time ms :body`)
);

app.get("/info", (req, res) => {
  Person.find({})
    .then((people) => {
      res.send(
        `<p>Phonebook, there are ${
          people.length
        } person in it.</p><p>${new Date().toLocaleString()}</p>`
      );
    })
    .catch((err) => {
      console.log("Error:", err.message);
      res.status(500).end();
    });
});

app.get("/api/persons", (req, res) => {
  Person.find({})
    .then((people) => {
      res.json(people);
    })
    .catch((err) => {
      console.log("Error:", err.message);
      res.status(500).end();
    });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(400).send({ error: "cannot find the person by id" });
      }
    })
    .catch((err) => next(err));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((err) => next(err));
});

// const generateId = (min, max) => {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max-min) + min)
// }

app.post("/api/persons", async (req, res, next) => {
  const body = req.body;
  if (!body.name) {
    return res.status(400).json({
      error: "name missing",
    });
  }
  if (!body.number) {
    return res.status(400).json({
      error: "number missing",
    });
  }

  //   existedPerson = await Person.findById(req.params.id);
  //   if (existedPerson) {
  //     const person = {
  //       name: body.name,
  //       number: body.number,
  //     };

  //     Person.findByIdAndUpdate(req.params.id, person, { new: true })
  //       .then((updatedPerson) => {
  //         res.json(updatedPerson);
  //       })
  //       .catch((error) => next(error));
  //   } else {
  //     const person = new Person({
  //       name: body.name,
  //       number: body.number,
  //     });
  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person
    .save()
    .then((savedPerson) => savedPerson.toJSON())
    .then((saveeAndFormattedPerson) => res.json(saveeAndFormattedPerson))
    .catch((err) => next(err));
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// handler of requests with unknown endpoint
app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
