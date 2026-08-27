import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import PublicNotFoundPage from "../PublicNotFoundPage";
import AppNotFoundPage from "../AppNotFoundPage";
import AccessRestrictedPage from "../AccessRestrictedPage";
import OfflinePage from "../OfflinePage";
import { ResourceUnavailableState } from "../ResourceUnavailableState";
import { FeatureUnavailableState } from "../FeatureUnavailableState";
import { renderWithProviders } from "../../../test/render";

describe("System State Pages", () => {
  it("renders PublicNotFoundPage with public branding and home recovery", () => {
    renderWithProviders(<PublicNotFoundPage />);

    expect(screen.getByText("Matrigluco")).toBeInTheDocument();
    expect(screen.getByText("This path doesn't exist")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go home/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in to account/i })).toBeInTheDocument();
  });

  it("renders AppNotFoundPage with in-app recovery actions", () => {
    renderWithProviders(<AppNotFoundPage />);

    expect(screen.getByText("This path doesn't exist")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go to dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
  });

  it("renders AccessRestrictedPage with protected boundary copy", () => {
    renderWithProviders(<AccessRestrictedPage />);

    expect(screen.getByText("This area isn't available to your account")).toBeInTheDocument();
  });

  it("renders OfflinePage with offline state indicator", () => {
    renderWithProviders(<OfflinePage />);

    expect(screen.getByText("OFFLINE")).toBeInTheDocument();
  });

  it("renders ResourceUnavailableState with ambiguous privacy-safe copy", () => {
    renderWithProviders(<ResourceUnavailableState resourceType="report" />);

    expect(screen.getByText("This resource isn't available")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /return to reports vault/i })).toBeInTheDocument();
  });

  it("renders FeatureUnavailableState with dormant module headline", () => {
    renderWithProviders(<FeatureUnavailableState featureName="Local AI" />);

    expect(screen.getByText("Local AI is currently unavailable")).toBeInTheDocument();
  });
});
