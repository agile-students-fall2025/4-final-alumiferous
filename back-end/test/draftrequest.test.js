// test/draftrequest.test.js
import request from "supertest";
import { expect } from "chai";
import app from "../app.js";

describe("Draft Request API", () => {
  describe("POST /api/requests", () => {
    it("should create a new skill request and return it", async () => {
      const newRequest = {
        skillId: "123",
        ownerId: "owner456",
        requesterId: "requester789",
        message: "I would love to learn this skill from you!",
      };

      const res = await request(app)
        .post("/api/requests")
        .send(newRequest)
        .set("Accept", "application/json");

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("requestId");
      expect(res.body).to.have.property("message", newRequest.message);
      expect(res.body).to.have.property("status", "pending");
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/requests")
        .send({ message: "Missing required fields" })
        .set("Accept", "application/json");

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("should accept requests with all required fields", async () => {
      const validRequest = {
        skillId: "skill001",
        ownerId: "user123",
        requesterId: "user456",
        message: "Looking forward to learning from you.",
      };

      const res = await request(app)
        .post("/api/requests")
        .send(validRequest)
        .set("Accept", "application/json");

      expect(res.status).to.equal(201);
      expect(res.body.message).to.equal(validRequest.message);
    });
  });

  describe("GET /api/requests/all", () => {
    it("should return a list of all requests", async () => {
      const res = await request(app)
        .get("/api/requests/all")
        .set("Accept", "application/json");

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("requests");
      expect(res.body.requests).to.be.an("array");
      if (res.body.requests.length > 0) {
        expect(res.body.requests[0]).to.have.property("requestId");
      }
    });
  });
});
