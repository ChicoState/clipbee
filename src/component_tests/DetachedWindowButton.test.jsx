import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DetachedWindowButton from "../components/DetachedWindowButton";

global.chrome = {
  runtime: {
    sendMessage: jest.fn()
  }
};

test("button click sends open detached window message", () => {
    render(<DetachedWindowButton />);
    const button = screen.getByTestId("detached-window-button");
    fireEvent.click(button);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ 
      target: "service-worker", 
      action: "OPEN_WINDOW" 
    });
});
