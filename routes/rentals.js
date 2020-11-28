const auth = require("../middleware/auth");
const { Movie, validate } = require("../models/movie");
const { Customer } = require("../models/customer");
const { Rental } = require("../models/rental");
const Fawn = require("fawn");
const mongoose = require("mongoose");
const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort("-dateOut");
  res.send(rentals);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send("Invalid Data");

  const customer = await Customer.find({ _id: req.body._id });
  if (!customer)
    return res.status(404).send("Customer with the given ID was not found");

  const movie = await Movie.find({ _id: req.body._id });
  if (!movie)
    return res.status(404).send("Movie with the given ID does not exist");

  if (movie.numberInStock === 0)
    return res.status(400).send("Movie not in stock");

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  try {
    new Fawn.Task() //Atomicity
      .save("rentals", rental)
      .update(
        "movies",
        { _id: movie._id },
        {
          $inc: { numberInStock: -1 },
        }
      )
      .run();

    res.send(rental);
  } catch (ex) {
    res.status(500).send("Soemthing Failed");
  }
});

module.exports = router;
