"use strict";

process.env.NODE_ENV = "test";

const assert = require("chai").assert;
const { suite, test } = require("mocha");
const bcrypt = require("bcrypt");
const request = require("supertest");
const knex = require("../knex");
const server = require("../index");

suite("users route", () => {
  const agent = request.agent(server);
  const password = "youreawizard";

  test("POST /signup", done => {
    request(server)
      .post("/signup")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "John",
        password
      })
      .expect(201, {
        user_id: 4,
        username: "John"
      })
      .expect("Content-Type", /json/)
      .end((httpErr, res) => {
        if (httpErr) {
          return done(httpErr);
        }

        knex("users")
          .where("user_id", 4)
          .first()
          .then(user => {
            const hashedPassword = user.hashed_password;

            delete user.hashed_password;

            assert.deepEqual(user, {
              user_id: 4,
              username: "John"
            });

            const isMatch = bcrypt.compareSync(password, hashedPassword);

            assert.isTrue(isMatch, "Passwords don't match");
            done();
          })
          .catch(dbErr => {
            done(dbErr);
          });
      });
  });

  test("POST /signup 'username already exists'", done => {
    request(server)
      .post("/signup")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "Tyler",
        password
      })
      .expect(400, "Username already exists", done);
  });

  test("POST /login", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "John",
        password
      })
      .expect("set-cookie", /token=[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+; Path=/)
      .expect(200, {
        userId: 4,
        username: "John",
        loggedIn: true
      })
      .expect("Content-Type", /json/)
      .end(done);
  });

  test("POST /login 'bad password'", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "John",
        password: "password"
      })
      .expect(400, "Bad username or password", done);
  });

  test("POST /login 'bad username'", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "Voldemort",
        password
      })
      .expect(400, "Bad username or password", done);
  });

  test("GET /users", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "John",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          .get("/users")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(
            200,
            [
              {
                user_id: 3,
                username: "Cornelius"
              },
              {
                user_id: 4,
                username: "John"
              },
              {
                user_id: 1,
                username: "Ronan"
              },
              {
                user_id: 2,
                username: "Tyler"
              }
            ],
            done
          );
      });
  });

  test("No token, no service", done => {
    request(server)
      .get("/users")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .expect(404, "Must be a registered user", done);
  });

  test("GET /users/:user_id", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "John",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          .get("/users/3")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(
            200,
            [
              {
                user_id: 3,
                username: "Cornelius"
              }
            ],
            done
          );
      });
  });

  test("GET /users/:user_id 'cannot get use who does not exist'", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "John",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          .get("/users/30")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(404, "User at 30 not found", done);
      });
  });

  test("PUT /users/:user_id 'change username'", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "John",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          .put("/users/3")
          .send({ username: "CorneliusFudge" })
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(
            200,
            [
              {
                user_id: 3,
                username: "CorneliusFudge"
              }
            ],
            done
          );
      });
  });

  // test("PUT /users/:user_id 'username must be unique'", done => {
  //   request(server)
  //     .post("/login")
  //     .set("Accept", "application/json")
  //     .set("Content-Type", "application/json")
  //     .send({
  //       username: "John",
  //       password
  //     })
  //     .end((err, res) => {
  //       if (err) return done(err);
  //
  //       agent
  //         .put("/users/4")
  //         .send({ username: "Ronan" })
  //         .set("Accept", "application/json")
  //         .set("Content-Type", "application/json")
  //         .set("Cookie", res.headers["set-cookie"])
  //         .expect(403, "Username must be unique", done);
  //     });
  // });

  test("DELETE /users/:user_id", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "John",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          .del("/users/3")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(
            200,
            {
              user_id: 3,
              username: "CorneliusFudge"
            },
            done
          );
      });
  });

  test("DELETE /users/:user_id 'cannot delete user who does not exist'", done => {
    request(server)
      .post("/login")
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        username: "John",
        password
      })
      .end((err, res) => {
        if (err) return done(err);

        agent
          .del("/users/20")
          .set("Accept", "application/json")
          .set("Content-Type", "application/json")
          .set("Cookie", res.headers["set-cookie"])
          .expect(404, "User at 20 not found", done);
      });
  });
});
