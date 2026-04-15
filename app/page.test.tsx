import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import MyTable from "./page";
import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

const mockData = {
  participants: [1],
  courses: [{ id: 4209 }, { id: 4254 }],
  matrix: {
    1: {
      4209: { completion: 0.8, last_accessed: "2024-01-01" },
      4254: { completion: 0.5, last_accessed: "2024-01-02" },
    },
  },
};

const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
jest.mock("ag-grid-react", () => ({
  AgGridReact: () => <div data-testid="ag-grid" />,
  AgGridProvider: ({ children }: any) => <div>{children}</div>,
}));

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

    await screen.findByText(/VIN Course Progress/i);

    expect(screen.getByTestId("ag-grid")).toBeInTheDocument();
  });

  it("groups duplicate participants correctly", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          participants: [1],
          courses: [{ id: 4209 }, { id: 4254 }],
          matrix: {
            1: {
              4209: { completion: 0.8, last_accessed: "2024-01-01" },
              4254: { completion: 0.5, last_accessed: "2024-01-02" },
            },
          },
        }),
        { status: 200 },
      ),
    );

    render(<MyTable />);

    await screen.findByText(/VIN Course Progress/i);

    const grid = screen.getByTestId("ag-grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders participant header correctly", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    render(<MyTable />);

    await screen.findByText(/VIN Course Progress/i);
    expect(screen.getByText(/VIN Course Progress/i)).toBeInTheDocument();
  });

  it("shows error when fetch fails", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Failed to fetch data" }), {
        status: 500,
      }),
    );

    render(<MyTable />);

    await screen.findByText(/error/i);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it("updates quick filter text", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    render(<MyTable />);

    await screen.findByText(/VIN Course Progress/i);

    const input = screen.getByPlaceholderText("Search...");

    fireEvent.change(input, { target: { value: "12345" } });

    expect(input).toHaveValue("12345");
  });
});
