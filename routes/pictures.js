"use strict";

const express = require("express");
const knex = require("../knex");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const verifyToken = require("./verify-token");

const PictureController = require("../controller/Pictures");

const router = express.Router();

let pictureController = new PictureController();

/**
 * @api {get} /pictures GET All pictures
 * @apiVersion 1.0.0
 * @apiGroup Pictures
 * @apiSuccess {Object[]} pictures Returns all pictures.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *       picture_id: 1,
 *       url: "https://farm1.staticflickr.com/2/1418878_1e92283336_m.jpg",
 *       lat: "54.627389",
 *       lon: "-122.500307"
 *     }]
 */

router.get("/pictures", (req, res) => {
  let allPictures = pictureController.getAllPictures();

  allPictures
    .then(multiPicturesData => {
      res.status(200).json(multiPicturesData);
    })
    .catch(err => {
      console.log("ERROR:", err);
      res.sendStatus(500);
    });
});

/**
 * @api {get} /pictures/:user_id GET Users pictures
 * @apiVersion 1.0.0
 * @apiGroup Pictures
 * @apiSuccess {Object[]} pictures Returns users pictures.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *       picture_id: 1,
 *       url: "https://farm1.staticflickr.com/2/1418878_1e92283336_m.jpg",
 *       lat: "54.627389",
 *       lon: "-122.500307"
 *     }]
 *
 * @apiError 404 User at :id not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "User at 1 not found"
 *     }
 */

router.get("/pictures/:user_id", verifyToken, (req, res) => {
  let user_id = req.params.user_id;

  pictureController.getAllUsersFavorites(user_id).then(usersFavorites => {
    if (usersFavorites.length === 0) {
      return res.status(404).send(`User at ${user_id} not found`);
    }
    res.status(200).json(usersFavorites);
  });
});

/**
 * @api {get} /pictures/:user_id/:picture_id GET Users pictures
 * @apiVersion 1.0.0
 * @apiGroup Pictures
 * @apiSuccess {Object} picture Returns a picture.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       picture_id: 1,
 *       url: "https://farm1.staticflickr.com/2/1418878_1e92283336_m.jpg",
 *       lat: "54.627389",
 *       lon: "-122.500307"
 *     }
 *
 * @apiError 404 User at :id not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "User at 1 not found"
 *     }
 */

router.get("/pictures/:user_id/:picture_id", verifyToken, (req, res) => {
  let user_id = req.params.user_id;
  let picture_id = req.params.picture_id;
  let checkForPicture = pictureController.checkIfUserHasFavorite(user_id);
  let specificPicture = pictureController.getPicturesByPictureId(picture_id);

  checkForPicture.then(allPictures => {
    if (!allPictures) {
      return res.status(404).send(`User at ${user_id} not found`);
    } else {
      allPictures.forEach(eachPicture => {
        if (eachPicture.picture_id === picture_id * 1) {
          specificPicture
            .then(result => {
              res.status(200).json(result);
              return;
            })
            .catch(err => {
              console.log("ERROR:", err);
              res.sendStatus(500);
            });
        }
      });
    }
  });
});

/**
 * @api {post} /pictures/:user_id POST Picture to user favorites
 * @apiVersion 1.0.0
 * @apiGroup Pictures
 * @apiSuccess {Object} picture Returns a picture.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       picture_id: 1,
 *       url: "https://farm1.staticflickr.com/2/1418878_1e92283336_m.jpg",
 *       lat: "54.627389",
 *       lon: "-122.500307"
 *     }
 *
 * @apiError 404 User at :id not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "User at 1 not found"
 *     }
 */

router.post("/pictures/:user_id", verifyToken, (req, res) => {
  let user_id = req.params.user_id;
  let pictureObj = req.body;
  let checkUserForPicture = pictureController.checkIfUserHasFavorite(user_id);
  let searchForURL = pictureController.searchForURL(pictureObj);
  let addToPictures = pictureController.addToPictures(pictureObj);

  checkUserForPicture
    .then(result => {
      if (result.length === 0) {
        return res.status(404).send(`User at ${user_id} not found`);
      }
      searchForURL
        .then(result => {
          if (result.length > 0) {
            pictureController.addToFavorites(user_id, result[0].picture_id).then(() => {
              return res.status(200).json(result);
            });
          } else {
            addToPictures
              .then(result => {
                pictureController.addToFavorites(user_id, result[0].picture_id).then(() => {
                  return res.status(200).json(result);
                });
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
 * @api {delete} /pictures/:user_id/:picture_id DELETE Picture from favorites
 * @apiVersion 1.0.0
 * @apiGroup Pictures
 * @apiSuccess {Object} picture Returns a picture.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       picture_id: 1,
 *       url: "https://farm1.staticflickr.com/2/1418878_1e92283336_m.jpg",
 *       lat: "54.627389",
 *       lon: "-122.500307"
 *     }
 *
 * @apiError 404 User at :id not found.
 * @apiError 404 Picture at :id not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "User at 1 not found"
 *     }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "Picture at 1 not found"
 *     }
 */

router.delete("/pictures/:user_id/:picture_id", verifyToken, (req, res) => {
  let user_id = req.params.user_id;
  let picture_id = req.params.picture_id;
  let checkUserForPicture = pictureController.checkIfUserHasFavorite(user_id);
  let pathPictureToDelete = pictureController.getPicturesByPictureId(picture_id);
  let pictureToDelete;
  let deletePictureFromFavorites = pictureController.deletePictureFromFavorites(
    user_id,
    picture_id
  );

  checkUserForPicture.then(result => {
    if (result.length === 0) {
      return res.status(404).send(`User at ${user_id} not found`);
    }
    pathPictureToDelete.then(result => {
      pictureToDelete = result;
    });
    deletePictureFromFavorites.then(result => {
      if (result > 0) {
        return res.status(200).json(pictureToDelete);
      }
      return res.status(404).send(`Picture at ${picture_id} not found`);
    });
  });
});

module.exports = router;
