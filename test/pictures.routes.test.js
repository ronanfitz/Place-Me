"use strict";

process.env.NODE_ENV = "test";

const assert = require("chai").assert;
const { suite, test } = require("mocha");
const bcrypt = require("bcrypt");
const request = require("supertest");
const knex = require("../knex");
const server = require("../index");

suite("pictures routes", () => {
  const agent = request.agent(server);
  const password = "youreawizard";
  /*=================================
      GET ALL FAVORITES (in the db)
  =================================*/
  test("GET /pictures", done => {
    request(server)
      .get("/pictures")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .expect(
        200,
        [
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
        ],
        done
      );
  });

  /*=================================
      GET ALL OF USERS' FAVORITES
  =================================*/
  test("GET /pictures/:user_id", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "Ronan",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          // GET Ronan's favorites
          .get("/pictures/1")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(
            200,
            [
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
              }
            ],
            done
          );
      });
  });

  test("GET /pictures/:user_id", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "Ronan",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          // GET Tyler's favorites
          .get("/pictures/2")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(
            200,
            [
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
            ],
            done
          );
      });
  });

  test("GET /pictures/:user_id 'where user does not exist'", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "Ronan",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          .get("/pictures/20")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(404, done);
      });
  });

  /*=================================
      GET ONE OF USERS' FAVORITES
  =================================*/
  test("GET /pictures/:user_id/:picture_id", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "Ronan",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          .get("/pictures/1/2")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(
            200,
            [
              {
                picture_id: 2,
                url: "https://farm1.staticflickr.com/2/9998878_4m62283336_l.jpg",
                lat: "44.600389",
                lon: "-122.726307"
              }
            ],
            done
          );
      });
  });

  /* TEST FOR: < < < < < < < < < < < < < < < < < < < < <
  - User not found (404)
  - Picture not found (404)
  > > > > > > > > > > > > > > > > > > > > > > > > > > > */

  /*=================================
        POST A USERS' FAVORITE

  // User does a search
  // User selects picture from those ~presented~

  // Tries to POST that picture info ({ url: "", lat: #, lon: # }) to the pictures table -- there will be no formal route for this POST. It should just try to add the info...

  // Knex checks to see if there is a picture in pictures table that has the same url as the picture object we are attempting to POST

  // IF SO:
  // // get the picture_id of that picture, and
  // // POST { user_id: #,  picture_id: # } to favorites table

  // IF NOT:
  // // add the data { url: "", lat: #, lon: # } to pictures table, and get the picture_id of the new entry, make it available, and...
  // // POST { user_id: #,  picture_id: # } to favorites table
  =================================*/

  test("POST /pictures/:user_id 'where picture is already in the pictures database'", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "Ronan",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          .post("/pictures/1")
          .set("Accept", "application/json")
          .send({
            url: "https://farm1.staticflickr.com/2/3788878_2f56283336_m.jpg",
            lat: "56.627389",
            lon: "-122.726777"
          })
          .expect("Content-Type", /json/)
          .set("Cookie", res.headers["set-cookie"])
          .expect(200, [
            {
              picture_id: 4,
              url: "https://farm1.staticflickr.com/2/3788878_2f56283336_m.jpg",
              lat: "56.627389",
              lon: "-122.726777"
            }
          ])
          .end((httpErr, res) => {
            if (httpErr) {
              return done(httpErr);
            }
            knex("favorites")
              .where({ user_id: 1, picture_id: 4 })
              .first()
              .then(favorite => {
                assert.deepEqual(favorite, {
                  favorite_id: 7,
                  user_id: 1,
                  picture_id: 4
                });
                done();
              })
              .catch(dbErr => {
                done(dbErr);
              });
          });
      });
  });

  test("POST /pictures/:user_id 'where picture is NOT already in the pictures database'", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "Ronan",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          .post("/pictures/1")
          .set("Accept", "application/json")
          .send({
            url: "https://farm1.staticflickr.com/2/1234567_8g10111213_i.jpg",
            lat: "12.345678",
            lon: "-122.726777"
          })
          .expect("Content-Type", /json/)
          .set("Cookie", res.headers["set-cookie"])
          .expect(200, [
            {
              picture_id: 5,
              url: "https://farm1.staticflickr.com/2/1234567_8g10111213_i.jpg",
              lat: "12.345678",
              lon: "-122.726777"
            }
          ])
          .end((httpErr, res) => {
            if (httpErr) {
              return done(httpErr);
            }
            knex("favorites")
              .where({ user_id: 1, picture_id: 5 })
              .first()
              .then(favorite => {
                assert.deepEqual(favorite, {
                  favorite_id: 8,
                  user_id: 1,
                  picture_id: 5
                });
                done();
              })
              .catch(dbErr => {
                done(dbErr);
              });
          });
      });
  });

  test("POST /pictures/:user_id 'where user is NOT already in the users database'", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "Ronan",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          .post("/pictures/20")
          .set("Accept", "application/json")
          .send({
            url: "https://farm1.staticflickr.com/2/1234567_8g10111213_i.jpg",
            lat: "12.345678",
            lon: "-122.726777"
          })
          .set("Cookie", res.headers["set-cookie"])
          .expect(404, done);
      });
  });

  /*=================================
        DELETE A USERS' FAVORITE
  =================================*/
  test("DELETE /pictures/:user_id/:picture_id", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "Ronan",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          .del("/pictures/1/2")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(200, [
            {
              picture_id: 2,
              url: "https://farm1.staticflickr.com/2/9998878_4m62283336_l.jpg",
              lat: "44.600389",
              lon: "-122.726307"
            }
          ])
          .end((httpErr, res) => {
            if (httpErr) {
              return done(httpErr);
            }
            knex("favorites")
              .where({ user_id: 1, picture_id: 2 })
              .first()
              .then(favorite => {
                assert.isUndefined(favorite);
                done();
              })
              .catch(dbErr => {
                done(dbErr);
              });
          });
      });
  });

  test("DELETE /pictures/:user_id/:picture_id 'where user is NOT already in the users database'", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "Ronan",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          .del("/pictures/20/1")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(404, "User at 20 not found", done);
      });
  });

  test("DELETE /pictures/:user_id/:picture_id 'where picture is NOT already in the picture database'", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "Ronan",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          .del("/pictures/1/40")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(404, "Picture at 40 not found", done);
      });
  });
});
