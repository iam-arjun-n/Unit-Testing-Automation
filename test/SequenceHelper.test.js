const SequenceHelper = require("../srv/lib/SequenceHelper");

describe("SequenceHelper - getNextRequestId", () => {
  let db;

  beforeEach(() => {
    db = {
      run: jest.fn()
    };
  });

  test("should return SPRC000001 when table has no records", async () => {
    db.run.mockResolvedValue([{ MAX_ID: null }]);

    const helper = new SequenceHelper({
      db,
      table: "DUMMY_TABLE"
    });

    const result = await helper.getNextRequestId();

    expect(db.run).toHaveBeenCalledTimes(1);
    expect(result).toBe("SPRC000001");
  });

  test("should increment requestId correctly when maxId exists", async () => {
    db.run.mockResolvedValue([{ MAX_ID: "SPRC000123" }]);

    const helper = new SequenceHelper({
      db,
      table: "DUMMY_TABLE"
    });

    const result = await helper.getNextRequestId();

    expect(result).toBe("SPRC000124");
  });

  test("should handle unexpected prefix gracefully and reset to 1", async () => {
    db.run.mockResolvedValue([{ MAX_ID: "INVALID123" }]);

    const helper = new SequenceHelper({
      db,
      table: "DUMMY_TABLE"
    });

    const result = await helper.getNextRequestId();

    expect(result).toBe("SPRC000001");
  });

  test("should handle empty result array", async () => {
    db.run.mockResolvedValue([]);

    const helper = new SequenceHelper({
      db,
      table: "DUMMY_TABLE"
    });

    const result = await helper.getNextRequestId();

    expect(result).toBe("SPRC000001");
  });

  test("should pad zeros correctly for small numbers", async () => {
    db.run.mockResolvedValue([{ MAX_ID: "SPRC000009" }]);

    const helper = new SequenceHelper({
      db,
      table: "DUMMY_TABLE"
    });

    const result = await helper.getNextRequestId();

    expect(result).toBe("SPRC000010");
  });
});
