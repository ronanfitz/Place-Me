"use strict";

const express = require("express");
const knex = require("../knex");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const UserController = require("../controller/Users");

const verifyToken = require("./verify-token");

const router = express.Router();

let userController = new UserController();

/**
 * @api {post} /signup POST signup
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiSuccess {String} username Returns the username of the User.
 * @apiSuccess {String} password  Returns the password of the User.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       username: "HarryPotter123",
 *       password: "youreawizard"
 *     }
 *
 * @apiError 400 Username already exists
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "Username already exists"
 *     }
 */

router.post("/signup", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  userController.getByUsername(username).then(result => {
    if (result.legnth) {
      return res.status(400).send("Username already exists");
    }
    userController
      .create(req.body)
      .then(result => {
        const newEntry = result[0];
        let payload = {
          userId: newEntry.user_id,
          username: newEntry.username
        };
        let secret = process.env.JWT_KEY;
        let token = jwt.sign(payload, secret);
        res.cookie("token", token);
        res.status(201).json(newEntry);
      })
      .catch(err => {
        console.log("ERROR:", err);
        res.sendStatus(500);
      });
  });
});

/**
 * @api {post} /login POST login
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiSuccess {String} payload  Returns the user login info.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       userId: 1,
 *       username: "HarryPotter123"
 *     }
 *
 * @apiError 400 Bad username or password
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "Bad username or password"
 *     }
 */

router.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  userController
    .getByUsername(username)
    .then(result => {
      if (!result) {
        return res.status(400).send("Bad username or password");
      }
      const userData = result[0];

      let payload = {
        userId: userData.user_id,
        username: userData.username,
        loggedIn: true
      };

      bcrypt.compare(password, userData.hashed_password).then(result => {
        if (!result) {
          return res.status(400).set("Content-Type", "text/plain").send("Bad username or password");
        }

        let secret = process.env.JWT_KEY;
        let token = jwt.sign(payload, secret);
        res.cookie("token", token).send(payload);
      });
    })
    .catch(err => {
      console.log("ERROR:", err);
      res.sendStatus(500);
    });
});

/**
 * @api {get} /users GET users
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiSuccess {String} users Returns all users.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        { user_id: 1, username: 'HarryPotter123' },
 *        { user_id: 2, username: 'RonWeasley123' },
 *        { user_id: 3, username: 'HermoineGranger123' },
 *        { user_id: 4, username: 'DracoMalfoy123' }
 *     }
 */

router.get("/users", verifyToken, (req, res) => {
  let allUsers = userController.getAllUsers();
  allUsers
    .then(result => {
      return res.status(200).json(result);
    })
    .catch(err => {
      console.log("ERROR:", err);
      res.sendStatus(500);
    });
});

/**
 * @api {get} /users/:user_id GET user
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiSuccess {String} user  Returns a single user.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        { user_id: 1, username: 'HarryPotter123' }
 *     }
 *
 * @apiError 404 User at :id not found
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "User at 1 not found"
 *     }
 */

router.get("/users/:user_id", verifyToken, (req, res) => {
  let searchedId = req.params.user_id;
  let singleUser = userController.getById(searchedId);

  singleUser
    .then(result => {
      if (!result) {
        return res.status(404).send(`User at ${searchedId} not found`);
      }
      return res.status(200).json(result);
    })
    .catch(err => {
      console.log("ERROR:", err);
      res.sendStatus(500);
    });
});

/**
 * @api {put} /users/:user_id UPDATE user
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiSuccess {String} user  Returns the updated user.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        { user_id: 1, username: 'HarryPotter321' }
 *     }
 *
 * @apiError 403 Username must be unique
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "Username must be unique"
 *     }
 */

router.put("/users/:user_id", verifyToken, (req, res) => {
  let searchedId = req.params.user_id;
  let { username, currentPassword, newPassword } = req.body; // User has to KNOW, and manually input their current plaintext password...and also enter a plaintext new password

  if (username) {
    updateUsername(res, username, searchedId);
  }

  // if (currentPassword && newPassword) {
  //   userController
  //     .getPassword(searchedId)
  //     .then(results => {
  //       if (results.length) {
  //         bcrypt.compare(currentPassword, results[0].hashed_password).then(result => {
  //           if (!result) return res.status(401).send("Incorrect password");
  //           bcrypt.hash(newPassword, 10).then(newHashedPassword => {
  //             changes["hashed_password"] = newHashedPassword;
  //             return;
  //           });
  //         });
  //       }
  //     })
  //     .catch(err => {
  //       console.log("ERROR:", err);
  //       res.sendStatus(500);
  //     });
  // }
  //
  // console.log("CHANGES", changes);
  //
  // userController.updateUser(searchedId, changes).then(result => {
  //   return res.status(200).json(result);
  // });
});

/**
 * @api {delete} /users/:user_id DELETE user
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiSuccess {String} user  Returns the deleted user.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        { user_id: 1, username: 'HarryPotter321' }
 *     }
 *
 * @apiError 404 User at :id not found
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "User at 1 not found"
 *     }
 */

router.delete("/users/:user_id", verifyToken, (req, res) => {
  let searchedId = req.params.user_id;
  let deletedUser;

  userController
    .getById(searchedId)
    .then(user => {
      if (!user) {
        return res.status(404).send(`User at ${searchedId} not found`);
      }
      deletedUser = user[0];
      return userController.deleteUser(searchedId);
    })
    .then(() => {
      res.send(deletedUser);
    })
    .catch(err => {
      console.log("ERROR:", err);
      res.sendStatus(500);
    });
});
//
//
//
//
//
//
//
//
//
function updateUsername(res, username, searchedId) {
  userController
    .getByUsername(username)
    .then(result => {
      if (result.length) {
        return res.status(403).send("Username must be unique");
      }
      let changes = { username: username };
      return changes;
    })
    .then(changes => {
      userController.updateUser(searchedId, changes).then(result => {
        return res.status(200).json(result);
      });
    })
    .catch(err => {
      console.log("ERROR:", err);
      res.sendStatus(500);
    });
}
//

module.exports = router;
