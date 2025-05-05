import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeleteButton from "../components/DeleteButton";

global.chrome = {
  runtime: {
    sendMessage: jest.fn()
  }
};

//fake setClipboardHistory
const setClipboardHistory = jest.fn();

test("button click sends remove single item message", () => {
    render(<DeleteButton item="item" clipboardHistory={[]} setClipboardHistory={setClipboardHistory} />);
    const button = screen.getByTestId("delete-single-button");
    fireEvent.click(button);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ 
      target: "service-worker", 
      item: "item",
      action: "REMOVE_SINGLE_ITEM"
    });
});

test("button hover changes scale", () => {
    const {container} = render(<DeleteButton item="item" clipboardHistory={[]} setClipboardHistory={setClipboardHistory} />);
    const button = container.firstChild;
    fireEvent.mouseEnter(button);
    expect(button.classList.contains("scale-125"));
});

test("button scale normal after mouse leave", () => {
    const {container} = render(<DeleteButton item="item" clipboardHistory={[]} setClipboardHistory={setClipboardHistory} />);
    const button = container.firstChild;
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    expect(!button.classList.contains("scale-125"));
});