"use strict";

const express = require("express");
const knex = require("../knex");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const verifyToken = require("./verify-token");

const CommentController = require("../controller/Comments");

const router = express.Router();

let commentController = new CommentController();

/**
 * @api {get} /comments/:user_id GET user comments
 * @apiVersion 1.0.0
 * @apiGroup Comments
 * @apiSuccess {Object[]} comments Comments of the user.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       comment_id: 1,
 *       user_id: 1,
 *       picture_id: 1,
 *       comment: 'I love to code!'
 *     }
 *
 * @apiError 404 This user hasn't commented or doesn't exist.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "This user hasn't commented or doesn't exist"
 *     }
 */

router.get("/comments/:user_id", verifyToken, (req, res) => {
  let user_id = req.params.user_id;
  let allUsersComments = commentController.getAllUsersComments(user_id);

  allUsersComments
    .then(usersComments => {
      if (usersComments.length === 0) {
        return res.status(404).send("This user hasn't commented or doesn't exist");
      }
      res.status(200).json(usersComments);
    })
    .catch(err => {
      console.log("ERROR:", err);
      res.sendStatus(500);
    });
});

/**
 * @api {get} /comments/:user_id/:picture_id GET user comment on a picture
 * @apiVersion 1.0.0
 * @apiGroup Comments
 * @apiSuccess {Object[]} comment User comment on a picture.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       comment_id: 1,
 *       user_id: 1,
 *       picture_id: 1,
 *       comment: 'I love to code!'
 *     }
 *
 * @apiError 404 Please enter a valid picture id.
 * @apiError 404 Please enter a valid user id.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "Please enter a valid picture id"
 *     }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "Please enter a valid user id"
 *     }
 */

router.get("/comments/:user_id/:picture_id", verifyToken, (req, res) => {
  let user_id = req.params.user_id;
  let picture_id = req.params.picture_id;
  let allUsersComments = commentController.getAllUsersComments(user_id);

  allUsersComments
    .then(usersComments => {
      if (usersComments.length > 0) {
        let total = usersComments.filter(comments => {
          return comments.picture_id === picture_id * 1;
        });
        if (total.length === 1) {
          res.status(200).json(total);
        } else {
          res.status(404).send("Please enter a valid picture id");
          return;
        }
      } else {
        res.status(404).send("Please enter a valid user id");
        return;
      }
    })
    .catch(err => {
      console.log("ERROR:", err);
      res.sendStatus(500);
    });
});

/**
 * @api {post} /comments/:user_id POST comment
 * @apiVersion 1.0.0
 * @apiGroup Comments
 * @apiSuccess {Object[]} comment Comment posted by the user.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       user_id: 1,
 *       picture_id: 1,
 *       comment: 'I love to code!'
 *     }
 *
 * @apiError 404 User not found.
 * @apiError 404 Please enter a valid picture id.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "User not found"
 *     }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "Please enter a valid picture id"
 *     }
 */

router.post("/comments/:user_id", verifyToken, (req, res) => {
  let user_id = req.params.user_id;
  let commentObj = req.body;
  commentObj.user_id = user_id;
  let addToComments = commentController.addToComments(commentObj);
  let checkForPicture = commentController.checkForPicture(commentObj.picture_id);
  let checkForUser = commentController.checkForUser(user_id);

  checkForUser
    .then(result => {
      if (result.length === 0) {
        res.status(404).send("User not found");
        return;
      }
      checkForPicture
        .then(pictureExists => {
          if (pictureExists.length === 0) {
            res.status(404).send("Please enter a valid picture id");
            return;
          } else {
            addToComments
              .then(result => {
                res.status(200).json(result);
                return;
              })
              .catch(err => {
                console.log("ERROR:", err);
                res.sendStatus(500);
              });
          }
        })
        .catch(err => {
          console.log("ERROR:", err);
          res.sendStatus(500);
        });
    })
    .catch(err => {
      console.log("ERROR:", err);
      res.sendStatus(500);
    });
});

/**
 * @api {delete} /comments/:user_id/:picture_id DELETE comment
 * @apiVersion 1.0.0
 * @apiGroup Comments
 * @apiSuccess {Object[]} comment Deleted comment.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       comment_id: 1,
 *       user_id: 1,
 *       picture_id: 1,
 *       comment: 'I love to code!'
 *     }
 *
 * @apiError 404 User not found.
 * @apiError 404 Picture not found.
 * @apiError 404 Comment not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "User not found"
 *     }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "Picture not found"
 *     }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "Comment not found"
 *     }
 */

router.delete("/comments/:user_id/:picture_id", verifyToken, (req, res) => {
  let user_id = req.params.user_id;
  let picture_id = req.params.picture_id;
  let commentToDelete = commentController.getCommentByIds(user_id, picture_id);
  let checkForPicture = commentController.checkForPicture(picture_id);
  let checkForUser = commentController.checkForUser(user_id);

  checkForUser.then(user => {
    if (user.length === 0) {
      res.status(404).send("User not found");
      return;
    } else {
      checkForPicture.then(picture => {
        if (picture.length === 0) {
          res.status(404).send("Picture not found");
          return;
        } else {
          commentToDelete.then(comment => {
            if (comment.length === 0) {
              res.status(404).send("Comment not found");
              return;
            } else {
              commentController.deleteComment(user_id, picture_id).then(result => {
                res.status(200).json(comment);
                return;
              });
            }
          });
        }
      });
    }
  });
});

module.exports = router;
