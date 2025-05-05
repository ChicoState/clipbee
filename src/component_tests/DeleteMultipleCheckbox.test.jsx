import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeleteMultipleCheckbox from "../components/DeleteMultipleCheckbox";

const setSelectedItems = jest.fn();

const mockProps = {
    item: "test item",
    selectedItems: new Set(),
    setSelectedItems: setSelectedItems
};

test("button click triggers setSelectedItems, with item", () => {
    mockProps.selectedItems = new Set();
    render(<DeleteMultipleCheckbox {...mockProps} />);
    const button = screen.getByTestId("delete-multiple-checkbox");
    fireEvent.click(button);
    expect(setSelectedItems).toHaveBeenCalledWith(new Set(["test item"]));
});

test("button click triggers setSelectedItems, without item, because deselected", () => {
    mockProps.selectedItems = new Set(["test item"]);
    render(<DeleteMultipleCheckbox {...mockProps} />);
    fireEvent.click(screen.getByTestId("delete-multiple-checkbox"));
    expect(setSelectedItems).toHaveBeenCalledWith(new Set());
});

test("button click changes checkbox to checked", () => {
    mockProps.selectedItems = new Set();
    const {container} = render(<DeleteMultipleCheckbox {...mockProps} />);
    const button = container.firstChild;
    fireEvent.click(button);
    expect(button.classList.contains("text-blue-500"));
});

test("button click changes checkbox to unchecked", () => {
    mockProps.selectedItems = new Set(["test item"]);
    const {container} = render(<DeleteMultipleCheckbox {...mockProps} />);
    const button = container.firstChild;
    fireEvent.click(button);
    expect(button.classList.contains("text-gray-400"));
});