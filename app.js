const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");

const jwt = require("jsonwebtoken");
const databasePath = path.join(__dirname, "userData.db");

app.use(express.json());
app.use(cors());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3001, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/home", async (request, response) => {
  response.send("HELLO WORLD");
});

app.post("/login", async (request, response) => {
  console.log(request.body);
  const { email, password } = request.body;

  const selectUserQuery = `SELECT * FROM user WHERE email = '${email}';`;
  const databaseUser = await database.get(selectUserQuery);

  if (databaseUser === undefined) {
    response.status(400);
    response.send("Invalid email");
  } else {
    if (databaseUser.password !== password) {
      response.status(400);
      response.send("Invalid Password");
    } else {
      if (password.length < 8) {
        response.status(400);
        response.send("Password must be 8 character long");
      } else {
        const payLoad = {
          email: email,
        };
        const jwtToken = jwt.sign(payLoad, "secret_token");

        response.status(200);
        response.send({ jwtToken });
      }
    }
  }
});

module.exports = app;
