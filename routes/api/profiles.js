const express = require("express");
const router = express.Router();
const passport = require("passport");
const JWT = require("jsonwebtoken");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const key = require("../../config/keys");
// Load Validation Files
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");
// @routes GET api/usersAuth/test
// desc test users route
// public

router.get("/test", (req, res) => res.json({ msg: "Profile is Working" }));

// @routes GET api/profiles/
// desc GET current user Profile
// private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const error = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar "])
      .then(profile => {
        if (!profile) {
          error.noprofile = "No profile for this users";
          return res.status(404).json(error);
        }
        res.json(profile);
      })
      .catch(err => console.log(err));
  }
);
// @routes GET api/profiles/hanle/:handle
// desc GET profile by handle
// public
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.profile = "No profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "No profile for this user" })
    );
});

// @routes GET api/profiles/user/:user_id
// desc GET profile by userid
// public
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.profile = "No profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "No profile for this user" })
    );
});
// @routes GET api/profiles/all
// desc GET all profiles
// public
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.profile = "There are no profiles";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({ Profile }));
});
// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Check for errors
    const { errors, isValid } = validateProfileInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    // Get fields

    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Spilt into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // create

        // Check for handle
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "Handle already exists";
            res.status(400).json(errors);
          }
          // save
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);
// @route   POST api/profile/experience
// @desc    add experince to profile
// @access  Private

router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.profile = "No profile for this user";
          res.status(404).json(errors);
        }
        // Get Experience
        const newExp = {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };
        // add experience
        profile.experience.unshift(newExp);
        profile.save().then(profile => res.json(profile));
      });
  }
);
// @route   POST api/profile education
// @desc    add education to profile
// @access  Private

router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.profile = "No profile for this user";
          res.status(404).json(errors);
        }
        // Get Education
        const newEdu = {
          school: req.body.school,
          degree: req.body.degree,
          feildofstudy: req.body.feildofstudy,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };
        // add education
        profile.experience.unshift(newEdu);
        profile.save().then(profile => res.json(profile));
      });
  }
);

// @route   DELETE api/profile education
// @desc    delete education from profile
// @access  Private
router.delete(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {}
);
module.exports = router;
