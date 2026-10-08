# Acrox TV Editorial Experience Specification

## Purpose

Define the focused Acrox TV directory and direct program experience while preserving Acrox's shared visual system and truthful asset states.

## Requirements

### Requirement: Focused Directory and Canonical Program Routes

The home page MUST present exactly two program cards, Alta Data ¡Te Tire! and Más que Nutrición. Each card MUST navigate to `/alta-data-te-tire` or `/mas-que-nutricion`; each direct page MUST use the shared Acrox `Navbar`, `Footer`, typography, labels, and page template.

#### Scenario: Browse and open a program

- GIVEN a visitor loads the home page on desktop or mobile
- WHEN the Acrox TV directory is rendered and a card is activated
- THEN exactly two cards are visible and navigation reaches the matching canonical route
- AND the destination renders the shared shell and program identity

#### Scenario: Direct refresh and invalid legacy route

- GIVEN a visitor refreshes a canonical program route or requests `/alta-data`
- WHEN routing resolves the request
- THEN the canonical page remains available after refresh
- AND the legacy alias is not presented as an additional supported route

### Requirement: Truthful Program Artwork and Visual Fidelity

The experience MUST retain the existing Acrox hierarchy, CSS conventions, and project fonts. A program hero MAY reference an optional supplied program-specific cover asset path, but MUST NOT invent, reuse generic/icon assets, or imply delivery of Guillermo's artwork. Until supplied, it MUST show a polished neutral state using only the known program name and summary.

#### Scenario: Artwork is not yet supplied

- GIVEN a program has no approved cover asset
- WHEN its hero renders on desktop or mobile
- THEN the program name and known summary appear in a designed no-artwork state
- AND no fabricated host, topic, logo, or reused generic cover is shown

### Requirement: Program Media and Sponsor Placement

Each direct program page MUST contain the existing `Episodes`, `Más visto`, and `Instagram` cards in that order. Its program-scoped sponsor strip MUST render after all three cards and before the footer on desktop and mobile; the home page MUST NOT render a sponsor strip.

#### Scenario: Render a program page

- GIVEN a canonical program page has loaded
- WHEN its content is displayed
- THEN the three media cards appear before the program sponsor region
- AND the sponsor region appears before the shared footer

#### Scenario: No sponsor assets are available

- GIVEN no real sponsor assets or identities have been supplied for a program
- WHEN its sponsor region renders
- THEN an honest polished waiting state is shown
- AND no invented sponsor, logo, identity, or obsolete home sponsor asset is reused

### Requirement: Accessible Sponsor Interaction

When real sponsor data is supplied, the program sponsor strip MUST expose only that program's sponsors, support keyboard access, pause motion on hover or focus, and disable continuous translation for reduced-motion users. Sponsor content MUST remain readable and operable in every state.

#### Scenario: Keyboard and reduced-motion use

- GIVEN a visitor tabs to a sponsor strip and prefers reduced motion
- WHEN focus enters the strip
- THEN sponsor links are reachable and readable
- AND automatic motion is disabled or reduced without blocking interaction
