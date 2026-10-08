# Program-Scoped Media Specification

## Purpose

Define program-owned editorial media without cross-attribution or unverified live and Instagram content.

## Requirements

### Requirement: Program-Scoped YouTube Playlists

The system MUST expose YouTube media only from the playlist registered for the rendered program: Alta Data `PL0Nzx2OTlHZ_ZOlLPB6gPjhH88yFGIF_y` and Más que Nutrición `PL0Nzx2OTlHZ_42gBgmG_9d6UqJgoXhWSq`. Provider identifiers MUST NOT be accepted from the browser.

#### Scenario: Render Alta Data video media

- GIVEN Alta Data’s registered playlist is available
- WHEN its program page requests YouTube media
- THEN only entries from Alta Data’s registered playlist are returned

#### Scenario: Playlist source fails

- GIVEN a program playlist is unavailable or stale
- WHEN media is requested
- THEN that program shows an explicit unavailable or stale state

### Requirement: Instagram Authorization Boundary

The system MUST provide program-scoped Instagram source architecture and an explicit unavailable or authorization-failure state. It MUST NOT render real Instagram media until that program’s professional account, linked Page, ownership, token, permissions, and fallback URL are authorized.

#### Scenario: Instagram is not authorized

- GIVEN a program has no complete Instagram authorization
- WHEN its page renders
- THEN it shows the defined unavailable state and no Instagram content

### Requirement: Ownership Isolation

The system MUST namespace provider, cache, and proxy data by program and source. It MUST NOT substitute sibling-program or producer Instagram media, assign live content, or render any live stream until channel ownership and canonical ID are confirmed.

#### Scenario: A source lacks validation

- GIVEN a requested program source lacks ownership validation
- WHEN the system resolves its media
- THEN it withholds only that source and never attributes another source’s content to the program
