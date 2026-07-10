import { fireEvent, render, screen } from "@testing-library/react";
import App from "../../src/app/App";
import { applyTheme, initialiseTheme, THEME_STORAGE_KEY } from "../../src/app/theme";

describe("theme preference boundary", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = `${THEME_STORAGE_KEY}=; Max-Age=0; Path=/`;
    document.documentElement.classList.remove("dark");
    document.documentElement.dataset.theme = "light";
  });

  it("restores and applies the same estate-wide light/dark preference key", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");

    expect(initialiseTheme()).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");

    applyTheme("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("persists only theme preference while clinical form text remains in memory", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Laparoscopic appendicectomy" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.change(screen.getByLabelText("Indication"), { target: { value: "Synthetic private form text" } });

    expect(Object.keys(window.localStorage)).toEqual([THEME_STORAGE_KEY]);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(JSON.stringify(window.localStorage)).not.toContain("Synthetic private form text");
  });
});
