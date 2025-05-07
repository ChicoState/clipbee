import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import OpenPopupButton from "../components/OpenPopupButton";

global.chrome = {
  runtime: {
    sendMessage: jest.fn()
  }
};

test("button click sends open popup message", () => {
    render(<OpenPopupButton />);
    const button = screen.getByTestId("open-popup-button");
    fireEvent.click(button);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ 
      target: "service-worker", 
      action: "OPEN_POPUP" 
    });
});

test("button displays 'Open Popup'", () => {
    render(<OpenPopupButton />);
    const button = screen.getByTestId("open-popup-button");
    expect(button.textContent).toBe("Open Popup");
});

