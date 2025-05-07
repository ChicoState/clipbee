import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SignOutButton from "../components/SignOutButton";

// TESTS NOT WORKING/PASSING BECAUSE OF NAVIGATE ISSUE
// BUTTON WORKS AS EXPECTED IN REAL WORLD TESTING
// SOME UNKWON ISSUE WITH NAVIGATE AND JEST I THINK

global.signOut = jest.fn();

global.chrome = {
  runtime: {
    sendMessage: jest.fn()
  },
  windows : {
    getCurrent: getCurrent
  },
};

test("button displays 'Sign Out'", () => {
    render(<SignOutButton />);
    const button = screen.getByTestId("sign-out-button");
    expect(button.textContent).toBe("Sign Out");
});

test("button click calls signOut", () => {
    render(<SignOutButton />);
    const button = screen.getByTestId("sign-out-button");
    fireEvent.click(button);
    expect(signOut).toHaveBeenCalled();
});

test("button click calls close side panel", () => {
    render(<SignOutButton />);
    const button = screen.getByTestId("sign-out-button");
    fireEvent.click(button);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ 
      target: "service-worker", 
      action: "CLOSE_SIDEPANEL",
      windowId: 1
    });
});

test("button click calls navigate to login", () => {
    useNavigate.mockReturnValue(navigate);
    render(<SignOutButton signOut={signOut} />);
    const button = screen.getByTestId("sign-out-button");
    fireEvent.click(button);
    expect(navigate).toHaveBeenCalledWith("/login");
});
