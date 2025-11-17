/* eslint-env mocha */
import request from "supertest";
import { expect } from "chai";
import app from "../app.js";

describe("Profile API", () => {
  // GET all users
  it("should get all users", async () => {
    const res = await request(app).get("/api/profile");
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
    // Optionally check shape of user object:
    if (res.body.length > 0) {
      expect(res.body[0]).to.have.property("userId");
      expect(res.body[0]).to.have.property("username");
    }
  });

  // GET single user
  it("should get a single user by id", async () => {
    const res = await request(app).get("/api/profile/1");
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("object");
    expect(res.body).to.have.property("userId");
    expect(res.body).to.have.property("username");
  });

  // PUT update user (no file upload)
  it("should update a user profile with JSON fields", async () => {
    const update = {
      userId: 1,
      username: "testuser",
      about: "A test user",
      skillsAcquired: JSON.stringify(["JS", "React"]),
      skillsWanted: JSON.stringify(["Python"]),
      profilePhoto: "/images/avatar-default.png"
    };

    const res = await request(app)
      .put("/api/profile/1")
      .set("content-type", "multipart/form-data")
      .field("userId", update.userId)
      .field("username", update.username)
      .field("about", update.about)
      .field("skillsAcquired", update.skillsAcquired)
      .field("skillsWanted", update.skillsWanted)
      .field("profilePhoto", update.profilePhoto);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("success", true);
    expect(res.body.user).to.include({ username: "testuser" });
  });
});

