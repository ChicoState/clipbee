import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SidePanelButton from "../components/SidePanelButton";

//fake getCurrent that returns an object with id
const getCurrent = jest.fn();
getCurrent.mockReturnValue({ id: 1 });

global.chrome = {
  runtime: {
    sendMessage: jest.fn()
  },
  windows : {
    getCurrent: getCurrent
  }
};

test("button click gets current window id", () => {
    render(<SidePanelButton />);
    const button = screen.getByTestId("side-panel-button");
    fireEvent.click(button);
    expect(getCurrent).toHaveBeenCalled();
});

test("button click sends open side panel message", () => {
    render(<SidePanelButton />);
    const button = screen.getByTestId("side-panel-button");
    fireEvent.click(button);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ 
      target: "service-worker", 
      action: "OPEN_SIDEPANEL",
      windowId: 1
    });
});