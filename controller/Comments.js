const bcrypt = require("bcrypt");
const knex = require("../knex");

class CommentController {
  getAllUsersComments(user_id) {
    return knex("comments").where("user_id", user_id);
  }

  addToComments(commentObj) {
    return knex("comments").insert(
      {
        user_id: commentObj.user_id,
        picture_id: commentObj.picture_id,
        comment: commentObj.comment
      },
      ["user_id", "picture_id", "comment"]
    );
  }

  checkForPicture(picture_id) {
    return knex("pictures").where("picture_id", picture_id);
  }

  checkForUser(user_id) {
    return knex("users").where("user_id", user_id).then(users => {
      return users.map(user => {
        delete user.hashed_password;
        return user;
      });
    });
  }

  getCommentByIds(user_id, picture_id) {
    return knex("comments").where("user_id", user_id).where("picture_id", picture_id);
  }

  deleteComment(user_id, picture_id) {
    return knex("comments").del().where("user_id", user_id).where("picture_id", picture_id);
  }
}

module.exports = CommentController;
