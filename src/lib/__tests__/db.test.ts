import { describe, it, expect } from "vitest";
import { runQuery, getDbClient } from "../db";

describe("Database Client Unit Tests", () => {
  it("should return simulated fallback when DATABASE_URL is not set", async () => {
    delete process.env.DATABASE_URL;
    const client = getDbClient();
    expect(client).toBeNull();

    const queryResult = (await runQuery("SELECT * FROM users")) as {
      simulated: boolean;
      rows: unknown[];
    };
    expect(queryResult.simulated).toBe(true);
    expect(queryResult.rows).toEqual([]);
  });
});
