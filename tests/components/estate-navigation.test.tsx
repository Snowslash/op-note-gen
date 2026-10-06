import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../../src/app/App";
import LandingPage from "../../src/landing/LandingPage";

describe.each([['landing', LandingPage], ['app', App]] as const)("%s estate navigation", (_route, Page) => {
  it("renders exactly Projects and GitHub while retaining the wordmark and theme control", () => {
    render(<Page />);
    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    const links = within(navigation).getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAccessibleName("Projects");
    expect(links[0]).toHaveAttribute("href", "https://sangeev.me/#projects");
    expect(links[1]).toHaveAccessibleName("GitHub");
    expect(links[1]).toHaveAttribute("href", "https://github.com/Snowslash");
    expect(screen.getByRole("link", { name: "Sangeev.me" })).toHaveAttribute("href", "https://sangeev.me");
    expect(screen.getByRole("button", { name: /Switch to (light|dark) mode/ })).toBeVisible();
  });
});
