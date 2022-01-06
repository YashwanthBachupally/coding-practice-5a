const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//api for all movie details
app.get("/movies/names/", async (req, res) => {
  const getMoviesQ = `SELECT * FROM movie;`;
  const dbRes = await db.all(getMoviesQ);
  res.send(dbRes);
  //let movieNamesList = dbRes.map((each) => ({ movieName: each.movie_name }));
  //res.send(movieNamesList);
});

// api 1...get all movie names

app.get("/movies/", async (req, res) => {
  const getMoviesQ = `SELECT * FROM movie;`;
  const dbRes = await db.all(getMoviesQ);
  //res.send(dbRes);
  let movieNamesList = dbRes.map((each) => ({ movieName: each.movie_name }));
  res.send(movieNamesList);
});

//api 2.  create a movie in table

app.post("/movies/", async (req, res) => {
  const movieDetails = req.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const dbQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(
        ${directorId},'${movieName}','${leadActor}'
    );`;
  dbRes = await db.run(dbQuery);
  const movie_id = dbRes.lastID;
  res.send("Movie Successfully Added");
});

//api 3.   get movie with movieId

app.get("/movie/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const dbQuery = `SELECT * FROM movie WHERE movie_id=${movieId}`;
  const dbRes = await db.get(dbQuery);
  //res.send(dbRes);
  res.send({
    movieId: dbRes.movie_id,
    directorId: dbRes.director_id,
    movieName: dbRes.movie_name,
    leadActor: dbRes.lead_actor,
  });
});

//api 4.   update movie. details

app.put("/movie/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const { directorId, movieName, leadActor } = req.body;
  const dbQuery = `UPDATE movie SET
    director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor} 
    WHERE movie_id=${movieId}';`;
  const dbRes = await db.run(dbQuery);
  res.send("Movie Details Updated");
});

//api 5...Deletes a movie from the movie table based on the movie ID

app.delete("/movie/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const dbQuery = `DELETE FROM movie WHERE movie_id=${movieId}`;
  const dbRes = await db.run(dbQuery);
  res.send("Movie Removed");
  //console.log(dbRes);
});

//api.  6...Returns a list of all directors in the director table
app.get("/directors/", async (req, res) => {
  const directorQuery = `SELECT * FROM director`;
  const dbRes = await db.all(directorQuery);
  //res.send(dbRes);
  res.send(
    dbRes.map((each) => ({
      directorId: each.director_id,
      directorName: each.director_name,
    }))
  );
});

//api 7 ... Returns a list of all movie names directed by a specific director

app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const getMoviesQ = `SELECT movie_name 
  FROM movie 
  WHERE director_id=${directorId};`;
  const dbRes = await db.all(getMoviesQ);
  //res.send(dbRes);
  let movieNamesList = dbRes.map((each) => ({ movieName: each.movie_name }));
  res.send(movieNamesList);
});

module.exports = app;
