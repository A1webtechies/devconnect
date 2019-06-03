const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const JWT = require("jsonwebtoken");
const User = require("../../models/User");
const key = require("../../config/keys");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
// @routes GET api/usersAuth/test
// desc test users route
// public
router.get("/test", (req, res) => res.json({ msg: "Users-auth is Working" }));

// @routes post api/usersAuth/register
// desc test register user
// public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exist";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "pg", //rating
        d: "mm" //default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        avatar
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            throw err;
          }
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @routes post api/usersAuth/login
// desc login the user
// public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    // Checking User
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }
    // Checking  Password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //USer Matched

        // JTW Sign
        const payload = { id: user.id, name: user.name, avatar: user.avatar };
        JWT.sign(
          payload,
          key.secretOrKey,
          { expiresIn: 43200 },
          (err, token) => {
            res.json({
              seccuss: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "Incorrect Password";
        return res.status(400).json(errors);
      }
    });
  });
});

// @routes post api/usersAuth/current
// desc Return Current User
// private

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email });
  }
);
// @routes post api/usersAuth/current
// desc Return Current User
// private

router.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    req.logout();
    res.redirect("/");
    console.log(req.user);
  }
);
module.exports = router;
