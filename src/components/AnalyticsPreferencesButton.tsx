"use client";

export default function AnalyticsPreferencesButton() {
  return (
    <button
      type="button"
      className="analytics-preferences-link"
      onClick={(event) => window.dispatchEvent(new CustomEvent("acrox:open-analytics-preferences", { detail: { trigger: event.currentTarget } }))}
    >
      Preferencias de analítica
    </button>
  );
}
