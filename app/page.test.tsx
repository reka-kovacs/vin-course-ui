import { transformDataForTable } from "./page";
import { transformColumns } from "./page";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import MyTable from "./page";
import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

const mockData = [
  {
    participant_id: 1,
    course_id: 4209,
    completion: 0.8,
    last_accessed: "2024-01-01T00:00:00Z",
  },
  {
    participant_id: 1,
    course_id: 4254,
    completion: 0.5,
    last_accessed: "2024-01-02T00:00:00Z",
  },
  {
    participant_id: 2,
    course_id: 4209,
    completion: null,
    last_accessed: null,
  },
];

const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
jest.mock("ag-grid-react");

beforeAll(() => {
  global.fetch = fetchMock;
});

beforeEach(() => {
  fetchMock.mockReset();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("transformDataForTable", () => {
  it("groups participants and courses correctly", () => {
    const input = [
      {
        participant_id: 1,
        course_id: 101,
        course_title: "Course A",
        completion: 80,
        last_accessed: "2025-01-01",
        first_accessed: "2024-12-01",
      },
      {
        participant_id: 1,
        course_id: 102,
        course_title: "Course B",
        completion: 50,
        last_accessed: "2025-01-02",
        first_accessed: "2024-12-02",
      },
    ];

    const result = transformDataForTable(input);

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].participant_id).toBe(1);

    expect(result.courses).toHaveLength(2);
  });

  it("formats course titles correctly", () => {
    const input = [
      {
        participant_id: 1,
        course_id: 999,
        course_title: "",
        completion: 20,
        last_accessed: null,
        first_accessed: null,
      },
    ];

    const result = transformDataForTable(input);

    expect(result.courses[0].title).toBe("Course 999");
  });
});

describe("transformColumns", () => {
  it("creates participant column first", () => {
    const cols = transformColumns([{ id: 2, title: "B" }]);

    expect(cols[0].field).toBe("participant_id");
  });

  it("sorts course columns by id", () => {
    const cols = transformColumns([
      { id: 10, title: "B" },
      { id: 2, title: "A" },
    ]);

    expect(cols[1].field).toBe("2");
    expect(cols[2].field).toBe("10");
  });
});

describe("table", () => {
  it("renders grid after successful fetch", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 }),
    );

    render(<MyTable />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Vin Course Progress/i)).toBeInTheDocument();
    });

    expect(screen.getByTestId("ag-grid")).toBeInTheDocument();
  });

  it("groups duplicate participants correctly", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            participant_id: 1,
            course_id: 1,
            completion: 10,
            last_accessed: "2024-01-02T00:00:00Z",
          },
          {
            participant_id: 1,
            course_id: 2,
            completion: 20,
            last_accessed: "2024-01-02T00:00:00Z",
          },
        ]),
        { status: 200 },
      ),
    );

    render(<MyTable />);

    await screen.findByText(/vin course progress/i);

    const grid = screen.getByTestId("ag-grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders participant header correctly", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    render(<MyTable />);

    await screen.findByText(/vin course progress/i);

    expect(screen.getByText(/vin course progress/i)).toBeInTheDocument();
  });

  it("shows error when fetch fails", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Failed to fetch data" }), {
        status: 500,
      }),
    );

    render(<MyTable />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it("updates quick filter text", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    render(<MyTable />);

    await waitFor(() => screen.getByText(/vin course progress/i));

    const input = screen.getByPlaceholderText("Search...");

    fireEvent.change(input, { target: { value: "12345" } });

    expect(input).toHaveValue("12345");
  });
});
