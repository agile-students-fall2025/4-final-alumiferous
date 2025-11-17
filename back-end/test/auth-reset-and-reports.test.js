// back-end/test/auth-reset-and-reports.test.js
import request from "supertest";
import app from "../app.js";
import { close } from "../server.js";

describe("Auth reset-password endpoint", function () {
  // Close the server after all tests are done
  after(function () {
    close();
  });

  it("should return 400 if email or newPassword is missing", async function () {
    // missing newPassword
    await request(app)
      .put("/api/auth/reset-password")
      .send({ email: "test@example.com" })
      .expect(400);

    // missing email
    await request(app)
      .put("/api/auth/reset-password")
      .send({ newPassword: "secret123" })
      .expect(400);
  });

  it("should return 400 if newPassword is too short", async function () {
    await request(app)
      .put("/api/auth/reset-password")
      .send({ email: "test@example.com", newPassword: "123" })
      .expect(400);
  });

  it("should return 200 and success=true for a valid reset", async function () {
    const res = await request(app)
      .put("/api/auth/reset-password")
      .send({ email: "test@example.com", newPassword: "secret123" })
      .expect(200);

    // Basic shape check
    if (!res.body || res.body.success !== true) {
      throw new Error("Expected success=true in reset-password response");
    }
  });
});

describe("Reports endpoint", function () {
  it("should return 400 when required fields are missing", async function () {
    // missing reporterId
    await request(app)
      .post("/api/reports")
      .send({
        targetType: "bug",
        category: "app-issue",
        message: "Something broke",
      })
      .expect(400);

    // missing message
    await request(app)
      .post("/api/reports")
      .send({
        reporterId: 1,
        targetType: "bug",
        category: "app-issue",
      })
      .expect(400);
  });

  it("should create a report and return 201 with report object", async function () {
    const res = await request(app)
      .post("/api/reports")
      .send({
        reporterId: 1,
        targetType: "bug",
        targetId: null,
        category: "app-issue",
        message: "The requests page crashed when I clicked accept.",
      })
      .expect(201);

    if (
      !res.body ||
      res.body.success !== true ||
      !res.body.report ||
      typeof res.body.report.reportId === "undefined"
    ) {
      throw new Error("Expected a created report with reportId in response");
    }
  });
});
