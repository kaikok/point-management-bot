import {configDotenv} from "dotenv";
configDotenv({path: ".env.local"});

import request from "supertest";
import app from "../src/app";

describe("Test app.ts", () => {
  test("hello route", async () => {
    const res = await request(app).get("/hello");
    expect(res.text).toEqual("Hello, Firebase!");
  });
});
