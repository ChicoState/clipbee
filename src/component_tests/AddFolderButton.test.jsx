import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AddFolderButton from "../components/AddFolderButton";

global.chrome = {
  runtime: {
    sendMessage: jest.fn()
  }
};

test("button click shows text box to add folder name", () => {
    render(<AddFolderButton folders={[]} />);
    const button = screen.getByTestId("add-folder-button");
    fireEvent.click(button);
    expect(screen.getByTestId("add-folder-input"));
});

test("button click shows cancel button when no text", () => {
    render(<AddFolderButton folders={[]} />);
    const button = screen.getByTestId("add-folder-button");
    fireEvent.click(button);
    expect(screen.getByTestId("cancel-add-folder-button"));
});

test("button click removes Add Folder button", () => {
    render(<AddFolderButton folders={[]} />);
    const button = screen.getByTestId("add-folder-button");
    fireEvent.click(button);
    expect(screen.queryByTestId("add-folder-button")).toBeNull();
});

test("confirm add folder button shows when text entered in input", () => {
    render(<AddFolderButton folders={[]} />);
    const button = screen.getByTestId("add-folder-button");
    fireEvent.click(button);
    const input = screen.getByTestId("add-folder-input");
    fireEvent.change(input, { target: { value: "test" } });
    expect(screen.getByTestId("confirm-add-folder-button"));
});

test("confim add folder button sends message to add folder", () => {
    render(<AddFolderButton folders={[]} />);
    const button = screen.getByTestId("add-folder-button");
    fireEvent.click(button);
    const input = screen.getByTestId("add-folder-input");
    fireEvent.change(input, { target: { value: "test" } });
    const confirmButton = screen.getByTestId("confirm-add-folder-button");
    fireEvent.click(confirmButton);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ 
      action: "ADD_FOLDER", 
      folderName: "test",
    });
});

test("cancel add folder button removes input from screen", () => {
    render(<AddFolderButton folders={[]} />);
    const button = screen.getByTestId("add-folder-button");
    fireEvent.click(button);
    const cancelButton = screen.getByTestId("cancel-add-folder-button");
    fireEvent.click(cancelButton);
    expect(screen.queryByTestId("add-folder-input")).toBeNull();
});

test("cancel add folder button reinstates Add Folder button", () => {
    render(<AddFolderButton folders={[]} />);
    const button = screen.getByTestId("add-folder-button");
    fireEvent.click(button);
    const cancelButton = screen.getByTestId("cancel-add-folder-button");
    fireEvent.click(cancelButton);
    expect(screen.getByTestId("add-folder-button"));
});
