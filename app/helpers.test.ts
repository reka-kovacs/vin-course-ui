import { formatCell, getColor, courseComparator } from "./helpers";

describe("formatCell", () => {
  it("should display the correct completion percentage", () => {
    const cellData = {
      completion: 0.8,
      last_accessed: "2025-10-30 08:45:38.7590000 -07:00",
    };
    const result = formatCell(cellData);
    expect(result).toBe("80%\n10/30/2025");
  });

  it("should handle null values gracefully", () => {
    const cellData = { completion: null, last_accessed: null };
    const result = formatCell(cellData);
    expect(result).toBe("—");
  });

  it("should handle missing last_accessed date", () => {
    const cellData = { completion: 0.5, last_accessed: null };
    const result = formatCell(cellData);
    expect(result).toBe("50%\n—");
  });

  it("should handle missing completion percentage", () => {
    const cellData = {
      completion: null,
      last_accessed: "2025-10-30 08:45:38.7590000 -07:00",
    };
    const result = formatCell(cellData);
    expect(result).toBe("N/A\n10/30/2025");
  });
});

describe("getColor", () => {
  it("should return transparent for null completion", () => {
    expect(getColor(null)).toBe("transparent");
  });

  it("should return red for completion less than 0.5", () => {
    expect(getColor(0.3)).toBe("#f8b9b9");
  });

  it("should return yellow for completion between 0.5 and 0.8", () => {
    expect(getColor(0.6)).toBe("#f1e09b");
  });

  it("should return green for completion greater than or equal to 0.8", () => {
    expect(getColor(0.8)).toBe("#a7f5c4");
    expect(getColor(1)).toBe("#a7f5c4");
  });
});

describe("courseComparator", () => {
  it("sorts by completion ascending", () => {
    const a = {
      completion: 0.2,
      last_accessed: "2025-10-30 08:45:38.7590000 -07:00",
    };
    const b = {
      completion: 0.8,
      last_accessed: "2025-10-31 08:45:38.7590000 -07:00",
    };

    expect(courseComparator(a, b)).toBeLessThan(0);
    expect(courseComparator(b, a)).toBeGreaterThan(0);
  });

  it("breaks ties using last_accessed date", () => {
    const a = {
      completion: 0.5,
      last_accessed: "2025-10-30 08:45:38.7590000 -07:00",
    };

    const b = {
      completion: 0.5,
      last_accessed: "2025-10-31 08:45:38.7590000 -07:00",
    };

    expect(courseComparator(a, b)).toBeLessThan(0);
  });
});
