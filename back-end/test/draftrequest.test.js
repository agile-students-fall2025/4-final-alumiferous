// test/draftrequest.test.js
import request from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";
import app from "../app.js";
import Request from "../models/Request.js";

describe("Draft Request API", () => {
  // Clean up test data after each test
  afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await Request.deleteMany({ message: /test/i });
    }
  });

  describe("POST /api/requests", () => {
    it("should create a new skill request and return it", async () => {
      const newRequest = {
        skillId: new mongoose.Types.ObjectId().toString(),
        skillName: "Test Skill",
        ownerId: new mongoose.Types.ObjectId().toString(),
        ownerName: "Test Owner",
        requesterId: new mongoose.Types.ObjectId().toString(),
        requesterName: "Test Requester",
        message: "I would love to learn this skill from you! (test)",
      };

      const res = await request(app)
        .post("/api/requests")
        .send(newRequest)
        .set("Accept", "application/json");

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("message", newRequest.message);
      expect(res.body).to.have.property("status", "pending");
      expect(res.body).to.have.property("createdAt");
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/requests")
        .send({ message: "Missing required fields (test)" })
        .set("Accept", "application/json");

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("should accept requests with all required fields", async () => {
      const validRequest = {
        skillId: new mongoose.Types.ObjectId().toString(),
        skillName: "Valid Test Skill",
        ownerId: new mongoose.Types.ObjectId().toString(),
        ownerName: "Valid Owner",
        requesterId: new mongoose.Types.ObjectId().toString(),
        requesterName: "Valid Requester",
        message: "Looking forward to learning from you. (test)",
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
        expect(res.body.requests[0]).to.have.property("_id");
      }
    });
  });
});
