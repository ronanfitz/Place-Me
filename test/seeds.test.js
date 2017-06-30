"use strict";

process.env.NODE_ENV = "test";

const assert = require("chai").assert;
const { suite, test } = require("mocha");
const knex = require("../knex");
suite("seeds", () => {
  test("users rows", done => {
    knex("users")
      .orderBy("user_id", "ASC")
      .then(actual => {
        let expected = [
          {
            user_id: 1,
            username: "Ronan",
            hashed_password: "$2a$12$BgnPH2oUiLRr8rnLmAIOF.wt2GfJoijHb/qbqNLx5fEMsQOzxyHfy"
          }
        ];

        for (let i = 0; i < expected.length; i++) {
          assert.deepEqual(actual[i], expected[i], `Row id=${i + 1} not the same`);
        }

        done();
      })
      .catch(err => {
        done(err);
      });
  });

  test("pictures rows", done => {
    knex("pictures")
      .orderBy("picture_id", "ASC")
      .then(actual => {
        let expected = [
          {
            picture_id: 1,
            url: "https://farm1.staticflickr.com/2/1418878_1e92283336_m.jpg",
            lat: "54.627389",
            lon: "-122.500307"
          },
          {
            picture_id: 2,
            url: "https://farm1.staticflickr.com/2/9998878_4m62283336_l.jpg",
            lat: "44.600389",
            lon: "-122.726307"
          },
          {
            picture_id: 3,
            url: "https://farm1.staticflickr.com/2/1418111_0a92445936_k.jpg",
            lat: "51.627900",
            lon: "-122.444307"
          },
          {
            picture_id: 4,
            url: "https://farm1.staticflickr.com/2/3788878_2f56283336_m.jpg",
            lat: "56.627389",
            lon: "-122.726777"
          }
        ];

        for (let i = 0; i < expected.length; i++) {
          assert.deepEqual(actual[i], expected[i], `Row id=${i + 1} not the same`);
        }

        done();
      })
      .catch(err => {
        done(err);
      });
  });

  test("favorites rows", done => {
    knex("favorites")
      .orderBy("favorite_id", "ASC")
      .then(actual => {
        let expected = [
          {
            favorite_id: 1,
            user_id: 1,
            picture_id: 1
          }
        ];

        for (let i = 0; i < expected.length; i++) {
          assert.deepEqual(actual[i], expected[i], `Row id=${i + 1} not the same`);
        }

        done();
      })
      .catch(err => {
        done(err);
      });
  });

  test("comments rows", done => {
    knex("comments")
      .orderBy("comment_id", "ASC")
      .then(actual => {
        let expected = [
          {
            comment_id: 1,
            user_id: 1,
            picture_id: 1,
            comment: "I love to code!"
          }
        ];

        for (let i = 0; i < expected.length; i++) {
          assert.deepEqual(actual[i], expected[i], `Row id=${i + 1} not the same`);
        }

        done();
      })
      .catch(err => {
        done(err);
      });
  });

  test("ratings rows", done => {
    knex("ratings")
      .orderBy("rating_id", "ASC")
      .then(actual => {
        let expected = [
          {
            rating_id: 1,
            user_id: 1,
            picture_id: 1,
            rating: 5
          }
        ];

        for (let i = 0; i < expected.length; i++) {
          assert.deepEqual(actual[i], expected[i], `Row id=${i + 1} not the same`);
        }

        done();
      })
      .catch(err => {
        done(err);
      });
  });
});
