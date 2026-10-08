# Acrox TV Editorial Experience Specification

## Purpose

Define the approved, focused Acrox TV directory and program experience without replacing Acrox’s shared identity.

## Requirements

### Requirement: Focused Acrox TV Directory

The home page MUST present one focused Acrox TV section containing exactly two program cards: Alta Data ¡Te Tire! and Más que Nutrición. Each card SHALL link directly to its canonical program path.

#### Scenario: Open the directory

- GIVEN a visitor loads the home page
- WHEN the Acrox TV section is rendered
- THEN it shows only the two approved program cards
- AND each card links to its canonical path

#### Scenario: Select a program

- GIVEN the directory is visible
- WHEN the visitor activates Alta Data or Más que Nutrición
- THEN navigation targets `/alta-data-te-tire` or `/mas-que-nutricion` respectively

### Requirement: Direct Shared Program Pages

The system MUST serve direct pages at `/alta-data-te-tire` and `/mas-que-nutricion`. Both pages SHALL use one shared program-page template and the real shared `Navbar` and `Footer`.

#### Scenario: Load a program URL directly

- GIVEN a visitor requests either canonical path
- WHEN the page loads or refreshes
- THEN the matching program renders in the shared shell and template

### Requirement: Acrox Visual and Asset Fidelity

The experience MUST retain Acrox’s existing labels, H1/body hierarchy, CSS hierarchy, and project fonts. It MUST use logical supplied or real assets; where an approved asset is unavailable, it SHALL show an honest neutral placeholder and MUST NOT invent people, sponsors, or brand material.

#### Scenario: Render an unavailable visual

- GIVEN a required approved visual is unavailable
- WHEN its surface is rendered
- THEN an explicit neutral placeholder is shown without fabricated attribution

### Requirement: Shared Accessible Sponsor Carousel

The shared sponsor carousel MUST expose supplied sponsors only, support keyboard access, and respect reduced-motion preferences. Animated motion SHALL not prevent reading, focus, or interaction.

#### Scenario: Reduced-motion carousel

- GIVEN the visitor prefers reduced motion
- WHEN the carousel is rendered
- THEN continuous animation is disabled or reduced while sponsor content remains accessible
