import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SortHistoryButton from "../components/SortHistoryButton";

const setSortOrder = jest.fn();
let sortOrder = "newest";

test("button displays 'Newest' when sortOrder is 'newest'", () => {
    render(<SortHistoryButton sortOrder={sortOrder} setSortOrder={setSortOrder} />);
    const button = screen.getByTestId("sort-history-button");
    expect(button.textContent).toBe("Newest");
});

test("button displays 'Oldest' when sortOrder is 'oldest'", () => {
    sortOrder = "oldest";
    render(<SortHistoryButton sortOrder={sortOrder} setSortOrder={setSortOrder} />);
    const button = screen.getByTestId("sort-history-button");
    expect(button.textContent).toBe("Oldest");
});

test("button click changes sortOrder to 'newest'", () => {
    sortOrder = "oldest";
    render(<SortHistoryButton sortOrder={sortOrder} setSortOrder={setSortOrder} />);
    const button = screen.getByTestId("sort-history-button");
    fireEvent.click(button);
    expect(setSortOrder).toHaveBeenCalledWith("newest");
});

test("button click changes sortOrder to 'oldest'", () => {
    sortOrder = "newest";
    render(<SortHistoryButton sortOrder={sortOrder} setSortOrder={setSortOrder} />);
    const button = screen.getByTestId("sort-history-button");
    fireEvent.click(button);
    expect(setSortOrder).toHaveBeenCalledWith("oldest");
});