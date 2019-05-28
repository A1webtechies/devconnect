const express = require("express");
const router = express.Router();

// @routes GET api/usersAuth/test
// desc test users route
// public
router.get("/test", (req, res) => res.json({ msg: "Posts is Working" }));

module.exports = router;
