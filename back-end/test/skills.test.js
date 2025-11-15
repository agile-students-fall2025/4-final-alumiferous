// test/skills.test.js
import request from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";
import app from "../app.js";

// connect to MongoDB BEFORE tests run
before(async function () {
  // increase timeout
  this.timeout(10000);

  const uri =
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/alumiferous_test";
    
  await mongoose.connect(uri);
});

// clean up AFTER all tests
after(async function () {
  // wipe test DB
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("POST /api/skills", () => {
  it("should create a new skill and return it", async () => {
    const newSkill = {
      category: "Programming",
      name: "JavaScript Basics",
      description: "I can teach fundamentals of JS, variables, loops, functions.",
    };

    const res = await request(app)
      .post("/api/skills")
      .send(newSkill)
      .set("Accept", "application/json");

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("_id");
    expect(res.body).to.have.property("category", newSkill.category);
    expect(res.body).to.have.property("name", newSkill.name);
    expect(res.body).to.have.property("description", newSkill.description);
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/skills")
      .send({})
      .set("Accept", "application/json");

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });
});
