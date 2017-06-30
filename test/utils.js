"use strict";
const knex = require("../knex");

// add knex database hooks to a test suite to tear down and build back
// up the database on each test in test suite.
const addDatabaseHooks = func => {
  return function(...args) {
    beforeEach(done => {
      console.log("before");
      knex.migrate
        .latest()
        // .then(() => {
        //   return knex.migrate.latest();
        // })
        .then(() => {
          return knex.seed.run();
        })
        .catch(err => {
          console.log("ERR ERR");
          if (err.routine !== "DropErrorMsgNonExistent") {
            throw err;
          }
        })
        .finally(() => {
          console.log("before done");
          done();
        });
    });

    afterEach(done => {
      console.log("after");
      knex.migrate
        .rollback()
        .catch(err => {
          if (err.routine !== "DropErrorMsgNonExistent") {
            throw err;
          }
        })
        .finally(() => {
          console.log("after done");
          done();
        });
    });

    return func(...args);
  };
};

module.exports = {
  addDatabaseHooks
};
