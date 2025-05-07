import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FolderSelector from "../components/FolderSelector";

global.chrome = {
  runtime: {
    sendMessage: jest.fn()
  }
};

const folders = ["Default", "Work"];

test("dropdown shows active folder", () => {
    render(<FolderSelector folders={folders} activeFolder={folders[0]} />);
    const dropdown = screen.getByTestId("folder-selector");
    expect(dropdown.value).toBe(folders[0]);
});

test("clicking dropdown opens dropdown", () => {
    render(<FolderSelector folders={folders} activeFolder={folders[0]} />);
    const dropdown = screen.getByTestId("folder-selector");
    fireEvent.click(dropdown);
    expect(screen.findByText(folders[1]));
});

test("dropdown change of value sends message to set active folder", () => {
    render(<FolderSelector folders={folders} activeFolder={folders[0]} />);
    const dropdown = screen.getByTestId("folder-selector");
    fireEvent.change(dropdown, { target: { value: folders[1] } });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ 
      action: "SET_ACTIVE_FOLDER", 
      folder: folders[1] 
    });
});