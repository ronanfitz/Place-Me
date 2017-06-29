"use strict";

process.env.NODE_ENV = "test";

const assert = require("chai").assert;
const { suite, test } = require("mocha");
const bcrypt = require("bcrypt");
const request = require("supertest");
const knex = require("../knex");
const server = require("../index");

suite("comments routes", () => {
  const agent = request.agent(server);
  const password = "youreawizard";

  /*=================================
      GET ALL OF USERS' COMMENTS
  =================================*/
  test("GET /comments/:user_id", done => {
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
          .get("/comments/1")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(
            200,
            [
              {
                comment_id: 1,
                user_id: 1,
                picture_id: 1,
                comment: "I love to code!"
              },
              {
                comment_id: 4,
                user_id: 1,
                picture_id: 3,
                comment: "Who says we can't do it all?"
              }
            ],
            done
          );
      });
  });

  test("GET /comments/:user_id", done => {
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
          // GET Tyler's comments
          .get("/comments/2")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(
            200,
            [
              {
                comment_id: 2,
                user_id: 2,
                picture_id: 4,
                comment: "Javascript is the best!"
              },
              {
                comment_id: 3,
                user_id: 2,
                picture_id: 2,
                comment: "Fullstack for the win."
              }
            ],
            done
          );
      });
  });

  test("GET /comments/:user_id 'where nothing comes back'", done => {
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
          .get("/comments/20")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(404, "This user hasn't commented or doesn't exist", done);
      });
  });

  /*=================================
      GET ONE OF USERS' COMMENTS
  =================================*/

  test("GET /comments/:user_id/:picture_id", done => {
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
          .get("/comments/2/2")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(
            200,
            [
              {
                comment_id: 3,
                user_id: 2,
                picture_id: 2,
                comment: "Fullstack for the win."
              }
            ],
            done
          );
      });
  });

  test("GET /comments/:user_id/:picture_id 'where picture is NOT already in the pictures database'", done => {
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
          .get("/comments/2/20")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(404, "Please enter a valid picture id", done);
      });
  });

  test("GET /comments/:user_id/:picture_id 'where user is NOT already in the users database'", done => {
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
          .get("/comments/20/2")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(404, "Please enter a valid user id", done);
      });
  });

  /*=================================
        POST A USERS' COMMENT
  =================================*/

  test("POST /comments/:user_id 'where picture is already in the pictures database'", done => {
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
          .post("/comments/1")
          .set("Accept", "application/json")
          .send({
            picture_id: 4,
            comment: "OMG! Best picture ever!"
          })
          .expect("Content-Type", /json/)
          .set("Cookie", res.headers["set-cookie"])
          .expect(200, [
            {
              user_id: 1,
              picture_id: 4,
              comment: "OMG! Best picture ever!"
            }
          ])
          .end((httpErr, res) => {
            if (httpErr) {
              return done(httpErr);
            }
            knex("comments")
              .where({ user_id: 1, picture_id: 4 })
              .first()
              .then(comment => {
                assert.deepEqual(comment, {
                  comment_id: 5,
                  user_id: 1,
                  picture_id: 4,
                  comment: "OMG! Best picture ever!"
                });
                done();
              })
              .catch(dbErr => {
                done(dbErr);
              });
          });
      });
  });

  test("POST /comments/:user_id 'where picture is NOT already in the pictures database'", done => {
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
          .post("/comments/1")
          .set("Accept", "application/json")
          .send({
            picture_id: 10,
            comment: "Worst. Picture. Ever."
          })
          .set("Cookie", res.headers["set-cookie"])
          .expect(404, "Please enter a valid picture id", done);
      });
  });

  test("POST /comments/:user_id 'where user is NOT already in the users database'", done => {
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
          .post("/comments/10")
          .set("Accept", "application/json")
          .send({
            picture_id: 4,
            comment: "OMG! Best picture ever!"
          })
          .set("Cookie", res.headers["set-cookie"])
          .expect(404, done);
      });
  });

  /*=================================
        DELETE A USERS' COMMENT
  =================================*/

  test("DELETE /comments/:user_id/:picture_id", done => {
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
          .del("/comments/1/4")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(200, [
            {
              comment_id: 5,
              user_id: 1,
              picture_id: 4,
              comment: "OMG! Best picture ever!"
            }
          ])
          .end((httpErr, res) => {
            if (httpErr) {
              return done(httpErr);
            }
            knex("comments")
              .where({ user_id: 1, picture_id: 4 })
              .first()
              .then(comment => {
                assert.isUndefined(comment);
                done();
              })
              .catch(dbErr => {
                done(dbErr);
              });
          });
      });
  });

  test("DELETE /comments/:user_id/:picture_id 'where user is NOT already in the users database'", done => {
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
          .del("/comments/10/4")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(404, "User not found", done);
      });
  });

  test("DELETE /comments/:user_id/:picture_id 'where picture is NOT already in the picture database'", done => {
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
          .del("/comments/1/40")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(404, "Picture not found", done);
      });
  });

  test("DELETE /comments/:user_id/:picture_id 'where comment is NOT already in the comments database'", done => {
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
          .del("/comments/2/3")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(404, "Comment not found", done);
      });
  });
});
