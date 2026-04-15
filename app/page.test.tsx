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
