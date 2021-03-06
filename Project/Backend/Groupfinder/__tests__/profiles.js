/*
import app from '../app';
import http from 'http';
import supertest from 'supertest';
*/
const app = require('../app');
const http = require('http');
const supertest = require('supertest');

import 'babel-polyfill';
var request;
var profileID;

describe("TESTING ALL PROFILE ROUTES", () => {
    beforeAll((done) => {
        var test_server = http.createServer(app);
        test_server.listen(done);
        request = supertest(test_server);
    });
    afterAll((done) => {
        test_server.close(done);
    });
    describe("POST /profiles/", () => {
        it("Should insert a new profile into the database", (done) => {
            var profile = {
                profile: {
                    id: null,
                    name: "web programmer",
                    project_id: 1,
                    skills: [
                        {
                            name: "test skill",
                            experience: 3,
                            weight: 1
                        }
                    ],
                    questions: ["Question 1", "Question 2"]
                }
            }
            request.post('/profiles/')
            .send(profile)
            .end((err, res) => {
                if (err) return done(err);
                profileID = res.body.id;
                expect(res.status).toBe(200);
                expect(typeof(res.body.id)).toBe('number');
                done();
            })
        });
    });
    describe("GET /profiles/:project_id", () => {
        it("Should get all profiles of a project from the database", (done) => {
            request.get(`/profiles/1`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).toBe(200);
                done();
            })
        });
    });
    describe("PUT /profiles/:profile_id", () => {
        it("Should update an existing profile in the database", (done) => {
            var profile = {
                profile: {
                    id: null,
                    name: "java programmer",
                    project_id: 1,
                    skills: [
                        {
                            name: "test skill adapted",
                            experience: 3,
                            weight: 2
                        }
                    ],
                    questions: ["Question 1 adapted", "Question 2 adapted"]
                }
            }
            request.put(`/profiles/${profileID}`)
            .send(profile)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).toBe(200);
                done();
            });
        })
    });
    describe("DELETE /profiles/:profile_id", () => {
        it("Should delete a profile from the database", (done) => {
            request.delete(`/profiles/${profileID}`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).toBe(200);   
                done();
            });
        })
    });
});