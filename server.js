const express = require("express");
const mongoose = require("mongoose");
const db = require("./config/keys").dbURL;
const app = express();

// connect db
mongoose
  .connect(db)
  .then(() => console.log("Connected to database successfully"))
  .catch(err => console.log(err));
//------------------------------------------------//
// ROUTES
app.get("/", (req, res) => {
  res.send("Hellow World");
});
// ------------------------------------------------- //
var port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is up on the port ${port} ....`));
