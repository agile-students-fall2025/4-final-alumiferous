// test/skills.test.js
import request from "supertest";
import { expect } from "chai";
import app from "../app.js";

describe("Skills API", () => {
  describe("POST /api/skills (mock data)", () => {
    it("should create a new skill and return it", async () => {
      const newSkill = {
        category: "Programming",
        name: "JavaScript Basics",
        detail: "I can teach fundamentals of JS.",
        image: "https://via.placeholder.com/300x200?text=JS", // optional
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

  describe("GET /api/skills (mock data)", () => {
    it("should return an array of skills", async () => {
      const res = await request(app).get("/api/skills");

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");

      if (res.body.length > 0) {
        const skill = res.body[0];
        expect(skill).to.have.property("skillId");
        expect(skill).to.have.property("name");
        expect(skill).to.have.property("category");
        expect(skill).to.have.property("image");
      }
    });
  });
});
