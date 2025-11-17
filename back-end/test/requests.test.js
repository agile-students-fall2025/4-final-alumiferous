// back-end/test/requests.test.js
import request from "supertest";
import { expect } from "chai";
import app from "../app.js";

describe("Requests API", () => {
  it("should create a new request (POST /api/requests)", async () => {
    const newRequest = {
      skillId: 42,
      skillName: "Python Basics",
      ownerId: 1,
      ownerName: "Skill Owner",
      requesterId: 100,
      requesterName: "Student A",
      message: "Hi, I'd love to learn this skill!",
    };

    const res = await request(app)
      .post("/api/requests")
      .send(newRequest)
      .set("Accept", "application/json");

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("requestId");
    expect(res.body).to.include({
      skillId: 42,
      skillName: "Python Basics",
      ownerId: 1,
      ownerName: "Skill Owner",
      requesterId: 100,
      requesterName: "Student A",
      message: "Hi, I'd love to learn this skill!",
      status: "pending",
    });
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/requests")
      .send({}) // missing everything
      .set("Accept", "application/json");

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });

  it("should return incoming requests for an owner (GET /api/requests/incoming)", async () => {
    // Arrange: create one more request for ownerId = 1
    await request(app)
      .post("/api/requests")
      .send({
        skillId: 99,
        skillName: "Public Speaking",
        ownerId: 1,
        ownerName: "Skill Owner",
        requesterId: 200,
        requesterName: "Student B",
        message: "Please accept my request!",
      });

    const res = await request(app)
      .get("/api/requests/incoming")
      .query({ userId: 1 });

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
    expect(res.body.length).to.be.greaterThan(0);

    const first = res.body[0];
    expect(first).to.have.property("ownerId", 1);
    expect(first).to.have.property("status", "pending");
  });

  it("should update a request status (PATCH /api/requests/:id)", async () => {
    // Arrange: create a request we will update
    const createRes = await request(app)
      .post("/api/requests")
      .send({
        skillId: 7,
        skillName: "Web Dev",
        ownerId: 2,
        ownerName: "Dev Owner",
        requesterId: 300,
        requesterName: "Student C",
        message: "Can we schedule a session?",
      });

    const id = createRes.body.requestId;

    // Act: accept the request
    const patchRes = await request(app)
      .patch(`/api/requests/${id}`)
      .send({ status: "accepted" })
      .set("Accept", "application/json");

    expect(patchRes.status).to.equal(200);
    expect(patchRes.body).to.have.property("requestId", id);
    expect(patchRes.body).to.have.property("status", "accepted");
  });

  it("should return 400 if PATCH has invalid status", async () => {
    const res = await request(app)
      .patch("/api/requests/999")
      .send({ status: "maybe" });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });
});
