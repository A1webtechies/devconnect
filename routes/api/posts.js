const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
// Load Model
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// Load validation files
const validatePostInput = require("../../validation/post");
// @routes GET api/post/test
// desc test post route
// public
router.get("/test", (req, res) => res.json({ msg: "Posts is Working" }));

// @routes POST api/posts/
// desc create post route
// private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newPost = {
      user: req.user.id,
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar
    };
    new Post(newPost)
      .save()
      .then(post => {
        res.json(post);
      })
      .catch(err => res.status(400).json(err));
  }
);
// @routes GET api/posts/
// desc get all posts
// public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No post found" }));
});
// @routes GET api/posts/:id
// desc get single post route
// public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostfound: "No post for this id" }));
});
// @routes PATCH api/posts/:id
// desc edit post route
// private
router.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const newPost = {};
    newPost.text = req.body.text;
    Post.findOneAndUpdate(
      { _id: req.params.id },
      { $set: newPost },
      { new: true }
    )
      .then(posts => res.json(posts))
      .catch(err => res.status(404).json(err));
  }
);
// @routes DELETE api/posts/:id
// desc delete post route
// private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.body.user })
      .then(profile => {
        Post.findById(req.params.id).then(post => {
          if (req.user.id !== post.user.id.toString()) {
            return res
              .status(401)
              .json({ unauthorized: "User is not authorized" });
          }
          post
            .remove()
            .then(() => {
              res.json({ deleted: true });
            })
            .catch(err => res.status(404).json(err));
        });
      })
      .catch(err =>
        res.status(400).json({ noprofile: "no profile for this user", err })
      );
  }
);

// @routes POST api/posts/like/:id
// desc like post route
// private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length > 0
            ) {
              return res.status(400).json({ liked: "Already Liked" });
            }
            post.likes.unshift({ user: req.user.id });
            post
              .save()
              .then(post => res.json(post))
              .catch(err => res.json(err));
          })
          .catch(err => res.json(err));
      })
      .catch(err => res.status(404).json(err));
  }
);
// @routes POST api/posts/unlike/:id
// desc unlike post route
// private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length === 0
            ) {
              return res
                .status(400)
                .json({ nolike: "You have not liked the post" });
            }
            // Get Remove index
            const removeIndex = post.likes
              .map(item => item.user.toString())
              .indexOf(req.user.id);

            // Splice out from the array
            post.likes.splice(removeIndex, 1);
            post
              .save()
              .then(post => res.json(post))
              .catch(err => res.status(400).json(err));
          })
          .catch(err => res.json(err));
      })
      .catch(err => res.status(404).json(err));
  }
);
// @routes POST api/posts/comment/:id
// desc comment on post
// private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // save to comments array
        post.comments.unshift(newComment);

        // save the post
        post
          .save()
          .then(post => res.json(post))
          .catch(err => res.status(400).json(err));
      })
      .catch(err => res.status(404).json(err));
  }
);
// @routes DELETE api/posts/comment/:id/:comment_id
// desc remove comment from post
// private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnoexist: "Comment does not exist" });
        }

        // Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice out from array of comments
        post.comments.splice(removeIndex, 1);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json(err));
  }
);
module.exports = router;
