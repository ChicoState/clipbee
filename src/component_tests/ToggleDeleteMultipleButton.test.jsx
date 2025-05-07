import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ToggleDeleteMultipleButton from "../components/ToggleDeleteMultipleButton";

const mockProps = {
    deleteMultipleMode: false,
    setDeleteMultipleMode: jest.fn()
};

test("button displays 'Delete Multiple' when deleteMultipleMode is false", () => {
    render(<ToggleDeleteMultipleButton {...mockProps} />);
    const button = screen.getByTestId("toggle-delete-multiple-button");
    expect(button.textContent).toBe("Delete Multiple");
});

test("button displays 'Cancel' when deleteMultipleMode is true", () => {
    mockProps.deleteMultipleMode = true;
    render(<ToggleDeleteMultipleButton {...mockProps} />);
    const button = screen.getByTestId("toggle-delete-multiple-button");
    expect(button.textContent).toBe("Cancel");
});

test("button click changes deleteMultipleMode to true", () => {
    mockProps.deleteMultipleMode = false;
    render(<ToggleDeleteMultipleButton {...mockProps} />);
    const button = screen.getByTestId("toggle-delete-multiple-button");
    fireEvent.click(button);
    expect(mockProps.setDeleteMultipleMode).toHaveBeenCalledWith(true);
});

test("button click changes deleteMultipleMode to false", () => {
    mockProps.deleteMultipleMode = true;
    render(<ToggleDeleteMultipleButton {...mockProps} />);
    const button = screen.getByTestId("toggle-delete-multiple-button");
    fireEvent.click(button);
    expect(mockProps.setDeleteMultipleMode).toHaveBeenCalledWith(false);
});