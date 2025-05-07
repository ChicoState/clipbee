import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "../components/SearchBar";

const mockProps = {
    searchQuery: "",
    setSearchQuery: jest.fn()
};

test("input shows placeholder when no search query", () => {
    render(<SearchBar {...mockProps} />);
    const input = screen.getByTestId("search-bar");
    expect(input.placeholder).toBe("Search clipboard history...");
});

test("input shows search query when search query is set", () => {
    mockProps.searchQuery = "test";
    render(<SearchBar {...mockProps} />);
    const input = screen.getByTestId("search-bar");
    expect(input.value).toBe("test");
});

test("input sends message to set search query", () => {
    mockProps.searchQuery = "";
    render(<SearchBar {...mockProps} />);
    const input = screen.getByTestId("search-bar");
    fireEvent.change(input, { target: { value: "test" } });
    expect(mockProps.setSearchQuery).toHaveBeenCalledWith("test");
});