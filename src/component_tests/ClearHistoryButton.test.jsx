import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ClearHistoryButton from "../components/ClearHistoryButton";

global.chrome = {
  runtime: {
    sendMessage: jest.fn()
  }
};

//fake setClipboardHistory
const setClipboardHistory = jest.fn();

test("button click sends clear history message", () => {
    render(<ClearHistoryButton setClipboardHistory={setClipboardHistory} />);
    const button = screen.getByText("Clear History");
    fireEvent.click(button);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ 
      target: "service-worker", 
      action: "CLEAR_HISTORY" 
    });
});