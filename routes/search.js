"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const SearchController = require("../controller/Search");

const router = express.Router();

let searchController = new SearchController();

/**
 * @api {get} /search GET Pictures request from API
 * @apiPermission none
 * @apiVersion 1.0.0
 * @apiGroup Search
 * @apiSuccess {Object[]} pictures Returns array of picture objects.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       url: "https://farm1.staticflickr.com/2/1418878_1e92283336_m.jpg",
 *       lat: "54.627389",
 *       lon: "-122.500307"
 *     }
 *
 * @apiError 400 Search requires both latitude and longetude.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "Search requires both latitude and longetude"
 *     }
 */

router.get("/search", (req, res) => {
  let lat = req.query.lat;
  let lon = req.query.lon;
  let reg = new RegExp(/^-?((1?[0-7]?|[0-9]?)[0-9]|180).[0-9]{1,6}$/);

  if (lon === "undefined" || lat === "undefined" || !lon || !lat) {
    return res
      .status(400)
      .set("Content-Type", "text/plain")
      .send("Search requires both lat and lon");
  } else if (!reg.exec(lat) || !reg.exec(lon)) {
    return res
      .status(400)
      .set("Content-Type", "text/plain")
      .send("Search requires valid coordinates");
  }

  let pictureData = searchController.getPictureData(lat, lon);

  pictureData
    .then(picArray => {
      return searchController.generateObjects(picArray, lat, lon);
    })
    .then(outputArray => {
      res.status(200).json(outputArray);
      return;
    })
    .catch(err => {
      return res
        .status(500)
        .set("Content-Type", "text/plain")
        .send("API cannot process this request");
    });
});

module.exports = router;
