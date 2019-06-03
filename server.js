// Node Modules
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");
// ------------------------------------------//
// Files
const db = require("./config/keys").dbURL;
const users = require("./routes/api/usersAuth");
const profiles = require("./routes/api/profiles");
const posts = require("./routes/api/posts");

// ------------------------------------------------//
const app = express();
// Body Parser Middlware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Passport Mildware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

// connect db
mongoose
  .connect(db, { useNewUrlParser: true, useFindAndModify: false })
  .then(() => console.log("Connected to database successfully"))
  .catch(err => console.log(err));
//------------------------------------------------//
// ROUTES
app.get("/", (req, res) => {
  res.send("Hellow World");
});

// Use Routes
app.use("/api/usersAuth", users);
app.use("/api/profiles", profiles);
app.use("/api/posts", posts);
// ----------------------------------//

// ------------------------------------------------- //
var port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is up on the port ${port} ....`));

module.exports = { app };
