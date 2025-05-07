import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeleteMultipleButton from "../components/DeleteMultpleButton";

global.chrome = {
  runtime: {
    sendMessage: jest.fn()
  }
};

const mockProps = {
    selectedItems: new Set(),
    setSelectedItems: jest.fn(),
    setDeleteMultipleMode: jest.fn()
};

const mockItems = [{ item: "test item", index: 0 }, { item: "test item 2", index: 1 }];

test("button click sends remove multiple items message", () => {
    mockProps.selectedItems = new Set([mockProps.item]);
    render(<DeleteMultipleButton {...mockProps} />);
    const button = screen.getByTestId("delete-multiple-button");
    fireEvent.click(button);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ 
      target: "service-worker", 
      action: "REMOVE_MULTIPLE_ITEMS",
      data: Array.from(mockProps.selectedItems)
    });
});

test("button displays 'item' when seleted items size is 1", () => {
    mockProps.selectedItems = new Set([mockItems[0]]);
    render(<DeleteMultipleButton {...mockProps} />);
    const button = screen.getByTestId("delete-multiple-button");
    expect(button.textContent).toBe("Delete 1 Item");
});

test("button displays 'items' when seleted items size is greater than 1", () => {
    mockProps.selectedItems = new Set([mockProps[0], mockItems[1]]);
    render(<DeleteMultipleButton {...mockProps} />);
    const button = screen.getByTestId("delete-multiple-button");
    expect(button.textContent).toBe("Delete 2 Items");
});

test("selected items are removed from set after button click", () => {
    mockProps.selectedItems = new Set([mockProps.item]);
    render(<DeleteMultipleButton {...mockProps} />);
    const button = screen.getByTestId("delete-multiple-button");
    fireEvent.click(button);
    expect(mockProps.setSelectedItems).toHaveBeenCalledWith(new Set());
});

test("delete multiple mode is set to false after button click", () => {
    mockProps.selectedItems = new Set([mockProps.item]);
    render(<DeleteMultipleButton {...mockProps} />);
    const button = screen.getByTestId("delete-multiple-button");
    fireEvent.click(button);
    expect(mockProps.setDeleteMultipleMode).toHaveBeenCalledWith(false);
});