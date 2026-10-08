# Delta for Acrox TV Editorial Experience

## MODIFIED Requirements

### Requirement: Focused Acrox TV Directory

The home page MUST present one focused Acrox TV section containing exactly two program cards: Alta Data ¡Te Tire! and Más que Nutrición. Each card SHALL link directly to its canonical program path, and the directory MUST NOT render a sponsor band or sponsor region.
(Previously: The directory requirement specified two program cards and canonical links but did not prohibit the home sponsor band.)

#### Scenario: Open the directory

- GIVEN a visitor loads the home page
- WHEN the Acrox TV section is rendered
- THEN it shows only the two approved program cards
- AND each card links to its canonical path

#### Scenario: Select a program

- GIVEN the directory is visible
- WHEN the visitor activates Alta Data or Más que Nutrición
- THEN navigation targets `/alta-data-te-tire` or `/mas-que-nutricion` respectively

#### Scenario: Render the home without sponsorship

- GIVEN a visitor loads the home page on desktop or mobile
- WHEN the Acrox TV directory is rendered
- THEN no sponsor band or sponsor region appears in the home directory

### Requirement: Acrox Visual and Asset Fidelity

The experience MUST retain Acrox’s existing labels, H1/body hierarchy, CSS hierarchy, and project fonts. Each program hero MUST support a future program-owned cover supplied for that program. When a cover is unavailable, the hero SHALL show a polished neutral waiting state using only the known program name and summary, and MUST NOT use generic, obsolete, logo, icon, host, topic, sponsor, or other invented visual material.
(Previously: Unavailable approved visuals used an honest neutral placeholder, without defining program-owned covers or the required absent-cover content.)

#### Scenario: Render an unavailable visual

- GIVEN a required approved visual is unavailable
- WHEN its surface is rendered
- THEN an explicit neutral placeholder is shown without fabricated attribution

#### Scenario: Render a supplied program cover

- GIVEN an approved cover exists for the current program
- WHEN its direct page renders on desktop or mobile
- THEN the hero uses that program-owned cover and does not use another program’s or a generic asset

#### Scenario: Render an absent program cover

- GIVEN no approved cover exists for the current program
- WHEN its direct page renders on desktop or mobile
- THEN the hero shows a designed waiting state containing only the existing program name and summary
- AND it does not invent hosts, topics, people, sponsors, logos, or cover artwork

### Requirement: Shared Accessible Sponsor Carousel

The sponsor surface MUST be program-owned and MUST render only supplied sponsor assets for the current program. Each direct program page SHALL render exactly one sponsor region after the complete existing `Episodios`, `Más visto`, and `Instagram` cards and before the shared footer. When no program-specific sponsor assets are supplied, it MUST show an explicit polished preparation or waiting state without invented sponsor names, logos, or obsolete generic assets. The home directory MUST NOT own or render this sponsor surface.
(Previously: A shared sponsor carousel exposed supplied sponsors and provided keyboard and reduced-motion access, without program ownership, direct-page placement, or an honest absent-assets state.)

#### Scenario: Render a program sponsor waiting state

- GIVEN the current program has no supplied sponsor assets
- WHEN its direct page renders on desktop or mobile
- THEN exactly one sponsor region appears after all three media cards and before the shared footer
- AND it shows an explicit preparation or waiting state without invented or generic sponsorship

#### Scenario: Render supplied program sponsors

- GIVEN the current program has supplied sponsor assets
- WHEN its direct page renders
- THEN the sponsor region exposes only those assets and remains owned by that program

#### Scenario: Reduced-motion carousel

- GIVEN the visitor prefers reduced motion
- WHEN the carousel is rendered
- THEN continuous animation is disabled or reduced while sponsor content remains accessible
