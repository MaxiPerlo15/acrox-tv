# Program-Scoped Media Specification

## Purpose

Define registry-governed program media, ownership isolation, and explicit unavailable states for Acrox TV pages.

## Requirements

### Requirement: Registry-Scoped YouTube Media

The system MUST resolve YouTube media only from the registered playlist for the rendered program: Alta Data `PL0Nzx2OTlHZ_ZOlLPB6gPjhH88yFGIF_y` and Más que Nutrición `PL0Nzx2OTlHZ_42gBgmG_9d6UqJgoXhWSq`. Browser requests MUST identify the program by allowlisted slug and MUST NOT provide provider identifiers.

#### Scenario: Load registered media

- GIVEN a visitor opens either canonical program page
- WHEN its YouTube source is available
- THEN only entries from that program's registered playlist are rendered
- AND titles, thumbnails, and links retain that program's ownership

#### Scenario: YouTube source is stale or unavailable

- GIVEN a program's registered playlist cannot be validated or fetched
- WHEN its media section renders
- THEN that program shows an explicit unavailable or stale state
- AND sibling or producer media is not substituted

### Requirement: Program-Scoped Instagram Authorization

The system MUST maintain an independent Instagram source and authorization state for each program. It MUST NOT render Instagram media until that program's professional account, linked Page, ownership, token, permissions, and fallback URL are authorized; incomplete authorization MUST render an explicit unavailable or error state.

#### Scenario: Instagram is not authorized

- GIVEN a program lacks complete Instagram authorization
- WHEN its `Instagram` card renders
- THEN the card shows the appropriate unavailable or authorization-error state
- AND it contains no producer-profile or sibling-program media

### Requirement: Ownership and Request Isolation

Provider, cache, and proxy data MUST be namespaced by program and source. The system MUST NOT accept browser-supplied provider IDs, cross-attribute sibling content, or render live streams before channel ownership and canonical ID validation are confirmed. Invalid slugs MUST be rejected without provider calls.

#### Scenario: Invalid or unvalidated source request

- GIVEN a request contains an unknown slug or a source without ownership validation
- WHEN the feed resolver handles it
- THEN it rejects the unknown request or withholds only the unvalidated source
- AND it makes no provider call for an invalid slug and never returns cross-program content
