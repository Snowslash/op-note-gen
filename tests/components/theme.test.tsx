import { fireEvent, render, screen } from "@testing-library/react";
import App from "../../src/app/App";
import {
  applyEstateTheme as applyTheme,
  ESTATE_THEME_STORAGE_KEY as THEME_STORAGE_KEY,
  initialiseEstateTheme as initialiseTheme,
} from "@sangeev/estate-ui";

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

  it("prefers a valid estate cookie and safely ignores malformed cookie encoding", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    document.cookie = `${THEME_STORAGE_KEY}=light; Path=/`;
    expect(initialiseTheme()).toBe("light");

    document.cookie = `${THEME_STORAGE_KEY}=%E0%A4%A; Path=/`;
    expect(initialiseTheme()).toBe("dark");
  });

  it("uses the system preference on a first visit with no estate cookie or local preference", () => {
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({ matches: true }),
    });

    expect(initialiseTheme()).toBe("dark");

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it("uses the shared public-estate header on the hosted app", () => {
    render(<App />);
    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(navigation).toBeVisible();
    const estateHeader = navigation.closest("header");
    expect(estateHeader?.parentElement).toHaveClass("min-h-screen");
    expect(estateHeader?.parentElement).not.toHaveClass("px-4", "max-w-6xl");
    expect(estateHeader?.nextElementSibling?.tagName).toBe("MAIN");
    expect(screen.getByRole("link", { name: "Sangeev" })).toHaveAttribute("href", "https://sangeev.me");
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "https://sangeev.me/#projects");
    expect(screen.getByRole("link", { name: "Op notes" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Scratchpad" })).toBeVisible();
    expect(screen.getByRole("link", { name: "AlignEd" })).toBeVisible();
  });

  it("persists only theme preference while clinical form text remains in memory", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    const lightToggle = screen.getByRole("button", { name: "Switch to light mode" });
    expect(lightToggle).toBeVisible();
    expect(lightToggle).toHaveClass("estate-theme-toggle");
    expect(lightToggle.querySelector("svg")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Laparoscopic appendicectomy" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.change(screen.getByLabelText("Indication"), { target: { value: "Synthetic private form text" } });

    expect(Object.keys(window.localStorage)).toEqual([THEME_STORAGE_KEY]);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(JSON.stringify(window.localStorage)).not.toContain("Synthetic private form text");
  });
});
