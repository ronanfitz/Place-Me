const bcrypt = require("bcrypt");
const knex = require("../knex");

class UserController {
  getByUsername(username) {
    return knex("users").where("username", username).then(user => {
      delete user.hashed_password;
      return user;
    });
  }

  create(data) {
    return bcrypt.hash(data.password, 10).then(hashedPassword => {
      return knex("users").insert(
        {
          username: data.username,
          hashed_password: hashedPassword
        },
        ["user_id", "username"]
      );
    });
  }

  getAllUsers() {
    return knex("users").orderBy("username", "asc").then(users => {
      return users.map(user => {
        delete user.hashed_password;
        return user;
      });
    });
  }

  getById(id) {
    return knex("users").where("user_id", id).then(users => {
      return users.map(user => {
        delete user.hashed_password;
        return user;
      });
    });
  }

  getPassword(id) {
    return knex("users").where("user_id", id).then(users => {
      return user.hashed_password;
    });
  }

  updateUser(id, changes) {
    return knex("users")
      .where("user_id", id)
      .update(changes, ["user_id", "username"]);
  }

  deleteUser(id) {
    return knex("users").del().where("user_id", id);
  }
}

//NEED TO WRITE UNIT TESTS

module.exports = UserController;
