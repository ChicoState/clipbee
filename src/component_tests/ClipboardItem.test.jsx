import React from "react";
import { render, screen } from "@testing-library/react";
import ClipboardItem from "../components/ClipboardItem";

//test setClipboardHistory
const setClipboardHistory = jest.fn();

//fake clipboardItemArgs
const clipboardItemArgs = {
    item: "test item",
    index: 0,
    clipboardHistory: ["test item 1", "test item 2"],
    setClipboardHistory: setClipboardHistory,
    deleteMultipleMode: false,
    selectedItems: new Set(),
    setSelectedItems: jest.fn()
};

test("Item renders with correct text", () => {
    render(<ClipboardItem {...clipboardItemArgs} />);
    expect(screen.getByText("test item"));
});

test("Delete multiple checkbox is rendered", () => {
    clipboardItemArgs.deleteMultipleMode = true;
    render(<ClipboardItem {...clipboardItemArgs} />);
    expect(screen.getByTestId("delete-multiple-checkbox"));
});

test("Delete button is rendered", () => {
    clipboardItemArgs.deleteMultipleMode = false;
    render(<ClipboardItem {...clipboardItemArgs} />);
    expect(screen.getByTestId("delete-single-button"));
});