import React from "react";
import { render, screen } from "@testing-library/react";
import ClipboardItem from "../components/ClipboardItem";

//test setClipboardHistory
const setClipboardHistory = jest.fn();

//fake clipboardItemArgs
const clipboardItemArgs = {
    item : { item: "test item", index: 0 },
    deleteMultipleMode: false,
    selectedItems: new Set(),
    setSelectedItems: jest.fn()
};

test("Item renders with correct text", () => {
    render(<ClipboardItem {...clipboardItemArgs} />);
    const clipboardItem = screen.getByTestId("clipboard-item");
    expect(clipboardItem.textContent).toBe("test item");
});

test("Delete multiple checkbox is rendered", () => {
    clipboardItemArgs.deleteMultipleMode = true;
    render(<ClipboardItem {...clipboardItemArgs} />);
    expect(screen.getByTestId("delete-multiple-checkbox"));
});

test("Delete multiple checkbox is not rendered when deleteMultipleMode is false", () => {
    clipboardItemArgs.deleteMultipleMode = false;
    render(<ClipboardItem {...clipboardItemArgs} />);
    expect(screen.queryByTestId("delete-multiple-checkbox")).toBeNull();
});

test("Delete button is rendered", () => {
    clipboardItemArgs.deleteMultipleMode = false;
    render(<ClipboardItem {...clipboardItemArgs} />);
    expect(screen.getByTestId("delete-single-button"));
});

test("Delete button is not rendered when deleteMultipleMode is true", () => {
    clipboardItemArgs.deleteMultipleMode = true;
    render(<ClipboardItem {...clipboardItemArgs} />);
    expect(screen.queryByTestId("delete-single-button")).toBeNull();
});