"use strict";

process.env.NODE_ENV = "test";

const assert = require("chai").assert;
const { suite, test } = require("mocha");
const request = require("supertest");
const server = require("../index");

suite("search routes", () => {
  test("GET /search?lat&lon 'in Sydney'", done => {
    let lat = -33.86882;
    let lon = 151.209296;
    request(server)
      .get(`/search?lat=${lat}&lon=${lon}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .expect(200)
      .end((httpErr, res) => {
        if (httpErr) {
          return done(httpErr);
        }

        let arrayOfPictureObjects = res.body;
        arrayOfPictureObjects.forEach(obj => {
          assert.property(obj, "url");
          assert.property(obj, "lat");
          assert.property(obj, "lon");
        });

        done();
      });
  });

  test("GET /search?lat&lon 'in Seoul'", done => {
    let lat = 37.566535;
    let lon = 126.977969;
    request(server)
      .get(`/search?lat=${lat}&lon=${lon}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .expect(200)
      .end((httpErr, res) => {
        if (httpErr) {
          return done(httpErr);
        }

        let arrayOfPictureObjects = res.body;
        arrayOfPictureObjects.forEach(obj => {
          assert.property(obj, "url");
          assert.property(obj, "lat");
          assert.property(obj, "lon");
        });

        done();
      });
  });

  test("GET /search?lat&lon 'where lat and lon are entered as strings'", done => {
    let lat = "37.566535";
    let lon = "126.977969";
    request(server)
      .get(`/search?lat=${lat}&lon=${lon}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .expect(200)
      .end((httpErr, res) => {
        if (httpErr) {
          return done(httpErr);
        }

        let arrayOfPictureObjects = res.body;
        arrayOfPictureObjects.forEach(obj => {
          assert.property(obj, "url");
          assert.property(obj, "lat");
          assert.property(obj, "lon");
        });

        done();
      });
  });

  test("GET /search?lat&lon 'invalid coordinates'", done => {
    let lat = +90;
    let lon = +180.2;
    request(server)
      .get(`/search?lat=${lat}&lon=${lon}`)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .expect(500, done);
  });

  test("GET /search?lat&lon 'lon undefined'", done => {
    let lat = -33.86882;
    let lon;
    request(server)
      .get(`/search?lat=${lat}&lon=${lon}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /plain/)
      .expect(400, "Search requires both lat and lon", done);
  });

  test("GET /search?lat 'lon not even entered'", done => {
    let lat = -33.86882;
    request(server)
      .get(`/search?lat=${lat}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /plain/)
      .expect(400, "Search requires both lat and lon", done);
  });

  test("GET /search?lat&lon 'lat undefined'", done => {
    let lat;
    let lon = 151.209296;
    request(server)
      .get(`/search?lat=${lat}&lon=${lon}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /plain/)
      .expect(400, "Search requires both lat and lon", done);
  });

  test("GET /search?lon 'lat not even entered'", done => {
    let lon = 151.209296;
    request(server)
      .get(`/search?lon=${lon}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /plain/)
      .expect(400, "Search requires both lat and lon", done);
  });

  test("GET /search/country=germany 'searching for things other than lat and lon'", done => {
    request(server)
      .get("/search/country=germany")
      .set("Accept", "application/json")
      .expect("Content-Type", /plain/)
      .expect(404, done);
  });

  test("GET /search 'no input'", done => {
    request(server)
      .get(`/search`)
      .set("Accept", "application/json")
      .expect("Content-Type", /plain/)
      .expect(400, "Search requires both lat and lon", done);
  });
});
