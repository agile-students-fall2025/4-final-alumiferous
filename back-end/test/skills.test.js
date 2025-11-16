// test/skills.test.js
import request from "supertest";
import { expect } from "chai";
import app from "../app.js";

describe("POST /api/skills (mock data)", () => {
  it("should create a new skill and return it", async () => {
    const newSkill = {
      category: "Programming",
      name: "JavaScript Basics",
      detail: "I can teach fundamentals of JS.",
    };

    const res = await request(app)
      .post("/api/skills")
      .send(newSkill)
      .set("Accept", "application/json");

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("skillId");
    expect(res.body).to.have.property("category", newSkill.category);
    expect(res.body).to.have.property("name", newSkill.name);
    expect(res.body).to.have.property("detail", newSkill.detail);
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
