import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "welcome123",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [];

let userColors

async function checkVisisted() {
  const result = await db.query("SELECT * FROM visited_countries JOIN family_members ON family_members.id = visited_countries.id WHERE visited_countries.id = $1",[currentUserId]);
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}
app.get("/", async (req, res) => {
  const countries = await checkVisisted();

  const result = await db.query("SELECT * from family_members");

  try{
    const userColor = await db.query("SELECT color from family_members WHERE id = $1",[currentUserId]);
    userColors = userColor.rows[0].color;
  }
  catch(err){
    userColors = "blue";
  }

  users = result.rows;

  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: userColors,
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (id,country_code) VALUES ($1,$2)",
        [currentUserId,countryCode]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/user", async (req, res) => {

  if (req.body.add === "new"){
    res.render(__dirname+"/views/new.ejs",{});
  }
  else{

    currentUserId = req.body.user;
    res.redirect("/");
  }
  
});

app.post("/new", async (req, res) => {
  const result = await db.query("INSERT INTO family_members (name, color) VALUES ($1,$2) RETURNING id",[req.body.name,req.body.color]);
  currentUserId = result.rows.id;
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
