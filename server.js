"use strict";

//----------------- declare variables ---------------------

const express = require("express");
const cors = require("cors");
require("dotenv").config(".env");
const expressLayouts = require("express-ejs-layouts");
const pg = require("pg");
var methodOverride = require("method-override");

// initialize the server
const app = express();

// Use cros
app.use(cors());

// view engine setup
app.set("view engine", "ejs");

//setup public folder
app.use(express.static("public"));

//set the encode for post body request
app.use(express.urlencoded({ extended: true }));

// using layouts
app.use(expressLayouts);

// Use super agent
const superagent = require("superagent");
const { json } = require("express");

// Declare a port
const PORT = process.env.PORT || 3000;

// delare database url
const client = new pg.Client(process.env.DATABASE_URL);

// override http methods
app.use(methodOverride("_method"));

// server test
client.connect().then(() => {
  app.listen(PORT, () => {
    console.log("I am listening to port: ", PORT);
  });
});

//----------------- Routes ---------------------
// Home route
app.get("/", homeHandler);

//Favorites
app.get("/favorites", favoritesHandler);

//save joke
app.post("/save", saveJokeHandler);

//get joke
app.get("/details/:id", getDetailsHandler);

//delete joke
app.delete("/delete/:id", deleteJokeHandler);

//update joke
app.put("/update/:id", updateJokeHandler);

//random joke
app.get("/random", randomJokeHandler);

//----------------- Handlers ---------------------
async function homeHandler(req, res) {
  let jokes = await getJokes();
  res.render("index", {
    jokes: jokes,
  });
}

async function saveJokeHandler(req, res) {
  let joke = req.body;
  let savedJoke = await saveJokes(joke);
  res.redirect("/favorites");
}

async function favoritesHandler(req, res) {
  let jokes = await getJokesDB();
  res.render("pages/favorites", {
    jokes: jokes,
  });
}

function deleteJokeHandler(req, res) {
  let id = req.params.id;
  deleteJoke(id);
  res.redirect("/favorites");
}

async function getDetailsHandler(req, res) {
  let id = req.params.id;
  let joke = await getJokeDetailDB(id);
  res.render("pages/details", {
    joke: joke,
  });
}

function updateJokeHandler(req, res) {
  let id = req.params.id;
  let joke = req.body;
  updateJoke(id, joke);
  res.redirect(`/details/${id}`);
}

async function randomJokeHandler(req, res) {
  let joke = await getRandom();
  res.render("pages/random", {
    joke: joke[0],
  });
}
//----------------- API ---------------------

function getJokes() {
  let url = "https://official-joke-api.appspot.com/jokes/programming/ten";
  let result = superagent
    .get(url)
    .then((res) => {
      return JSON.parse(res.text).map((e) => {
        return new Joke(e);
      });
    })
    .catch((error) => {
      console.log(error);
    });
  return result;
}

function getRandom() {
  let url = "https://official-joke-api.appspot.com/jokes/programming/random";
  let result = superagent
    .get(url)
    .then((res) => {
      // console.log(res);
      return JSON.parse(res.text);
    })
    .catch((error) => {
      console.log(error);
    });
  return result;
}

//----------------- Database ---------------------
function saveJokes(joke) {
  let SQL =
    "INSERT INTO jokes (type,setup,punchline) VALUES ($1,$2,$3) RETURNING id";
  let values = [joke.type, joke.setup, joke.punchline];
  return client
    .query(SQL, values)
    .then((result) => {
      //   console.log(result);
    })
    .catch((error) => {
      console.log(error);
    });
}

function getJokesDB() {
  let SQL = "SELECT * FROM jokes";
  return client
    .query(SQL)
    .then((result) => {
      return result.rows;
    })
    .catch((error) => {
      console.log(error);
    });
}

function deleteJoke(id) {
  let SQL = "DELETE FROM jokes WHERE id=$1";
  let values = [id];
  return client
    .query(SQL, values)
    .then((result) => {
      // console.log(result);
    })
    .catch((error) => {
      console.log(error);
    });
}

function getJokeDetailDB(id) {
  let SQL = "SELECT * FROM jokes WHERE id=$1";
  let values = [id];
  return client
    .query(SQL, values)
    .then((result) => {
      return result.rows[0];
    })
    .catch((error) => {
      console.log(error);
    });
}

function updateJoke(id, joke) {
  let SQL =
    "UPDATE jokes SET type = $1, setup = $2, punchline=$3  WHERE id=$4;";
  let values = [joke.type, joke.setup, joke.punchline, id];
  return client
    .query(SQL, values)
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log(error);
    });
}
//----------------- constructor ---------------------

function Joke(data) {
  this.id = data.id;
  this.type = data.type;
  this.setup = data.setup;
  this.punchline = data.punchline;
}
