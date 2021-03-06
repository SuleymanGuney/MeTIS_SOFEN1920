import app from '../app';
import http from 'http';
import supertest from 'supertest';
import 'babel-polyfill';
import { isArray } from 'util';
var request;
var projectID;

describe("TESTING ALL PROJECT ROUTES", () => {
    beforeAll((done) => {
        var test_server = http.createServer(app);
        test_server.listen(done);
        request = supertest(test_server);
    });
    afterAll((done) => {
        test_server.close(done);
    });
    describe("POST /projects/", () => {
        it("Should insert a new project (with profiles and skills) into the database", (done) => {
            var project = {
                id: null,
                name: "test project",
                status: 1,
                pitch: "test pitch",
                created_at: "2019-11-27 10:00:00", // 'YYYY-MM-DD hh:mm:ss' format
                edited_at: "2019-11-27 10:00:00", // 'YYYY-MM-DD hh:mm:ss' format
                creator_id: 1,
                creator_first_name: 'Lennert',
                creator_last_name: 'Geebelen',
                profiles: [
                    {
                        id: null,
                        name: "test profile",
                        project_id: null,
                        skills: [
                            {
                                name: "test skill",
                                experience: 3,
                                weight: 2
                            }
                        ],
                        questions: ["Question 1", "Question 2"]
                    }
                ],
                categories: [
                    {
                        id: 1,
                        name: "Web",
                        subcategory: "Chrome"
                    }
                ]
            }
            request.post('/projects/')
            .send(project)
            .end((err, res) => {
                if (err) return done(err);
                projectID = res.body.id;
                expect(res.status).toBe(200);
                expect(typeof(res.body.id)).toBe('number');
                done();
            })
        });
    });
    describe("GET /projects/:project_id", () => {
        it("Should get a project from the database", (done) => {
            request.get(`/projects/${projectID}`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).toBe(200);
                done();
            })
        });
    });
    describe("GET /projects/", () => {
        it("Should get all projects from the database", (done) => {
            request.get('/projects/')
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).toBe(200);
                expect(typeof(res.body)).toBe('object');
                done();
            })
        })
    });
    describe("GET /projects/owner/:user_id", () => {
        it("Should get all projects with user_id the id of the project owner", (done) => {
            request.get(`/projects/owner/1`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).toBe(200);
                expect(typeof(res.body)).toBe('object');
                done();
            });
        });
    });
    describe("GET /projects/teammember/:user_id", () => {
        it("Should get all projects where user with user_id is a member of the team", (done) => {
            request.get(`/projects/teammember/1`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).toBe(200);
                expect(typeof(res.body)).toBe('object');
                done();
            })
        })
    });
    describe("PUT /projects/:project_id", () => {
        it("Should update an existing project in the database", (done) => {
            var project = {
                project: {
                    id: null,
                    name: "test project",
                    status: 1,
                    pitch: "test pitch",
                    created_at: "2019-11-27 10:00:00", // 'YYYY-MM-DD hh:mm:ss' format
                    edited_at: "2019-11-27 10:00:00", // 'YYYY-MM-DD hh:mm:ss' format
                    creator_id: 1,
                    creator_first_name: 'Lennert',
                    creator_last_name: 'Geebelen',
                    profiles: [
                        {
                            id: null,
                            name: "test profile adapted",
                            project_id: null,
                            skills: [
                                {
                                    name: "test skill adapted",
                                    experience: 3,
                                    weight: 1
                                }
                            ],
                            questions: ["Question 1 adapted", "Question 2 adapted"]
                        }
                    ],
                    categories: [
                        {
                            id: 1,
                            name: "Web",
                            subcategory: "Chrome"
                        }
                    ]
                }
            }
            request.put(`/projects/${projectID}`)
            .send(project)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).toBe(200);
                done();
            });
        })
    });
    describe("GET /projects/search/:str", () => {
        it("Should return the project that is edited in the previous test", (done) => {
            request.get(`/projects/search/proj`) // proj is substring of test project
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).toBe(200);
                expect(typeof(res.body)).toBe('object');
                expect(isArray(res.body)).toBe(true);
                expect(res.body.length).toBeGreaterThan(0);
                done();
            });
        })
    });
    describe("DELETE /projects/:project_id", () => {
        it("Should delete a profile from the database", (done) => {
            request.delete(`/projects/${projectID}`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).toBe(200);   
                done();
            });
        })
    });
});