const bcrypt = require("bcrypt");
const knex = require("../knex");

class PictureController {
  getAllUsersFavorites(user_id) {
    let subquery = knex("favorites").select("picture_id").where("user_id", user_id);
    return knex("pictures").where("picture_id", "in", subquery);
  }

  getAllPictures() {
    return knex("pictures").orderBy("picture_id", "asc");
  }

  checkIfUserHasFavorite(user_id) {
    return knex("favorites").where("user_id", user_id);
  }

  getPicturesByPictureId(picture_id) {
    return knex("pictures").where("picture_id", picture_id);
  }

  addToFavorites(user_id, picture_id) {
    return knex("favorites").insert({ user_id: user_id, picture_id: picture_id }, ["picture_id"]);
  }

  searchForURL(pictureObj) {
    return knex("pictures").where("url", pictureObj.url);
  }

  addToPictures(pictureObj) {
    return knex("pictures").insert(
      {
        url: pictureObj.url,
        lat: pictureObj.lat,
        lon: pictureObj.lon
      },
      ["picture_id", "url", "lat", "lon"]
    );
  }

  deletePictureFromFavorites(user_id, picture_id) {
    return knex("favorites").del().where("user_id", user_id).where("picture_id", picture_id);
  }
}

module.exports = PictureController;
