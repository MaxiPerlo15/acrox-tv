# Technical Debt Notes

## P2-1: In-memory cache does not scale to multi-instance

### Current state
- `src/infrastructure/swr-cache.ts` uses process-memory maps for entries, snapshots and in-flight requests.
- `src/infrastructure/youtube.client.ts` also keeps quota cooldown state in process memory.

### Operational impact
- Works well in simple topologies and low/medium traffic with a single instance.
- In multi-instance or serverless topologies, cache and cooldown state can drift between instances.
- This may increase external API calls and produce inconsistent refresh timing.

### Future direction
- Move cache and quota coordination to shared storage (Redis, KV, or edge cache strategy).

## P2-4: Strong dependency on YouTube and Instagram providers

### Current state
- Home feed depends on provider availability and latency:
  - `src/infrastructure/instagram.client.ts`
  - `src/infrastructure/youtube.client.ts`
  - `src/app/api/acroxtv-feed/route.ts`

### Existing mitigation
- SWR-like caching strategy with stale returns and snapshots.
- Empty and integration-error fallbacks at UI level.

### Remaining gap
- There is no persistent content store for home feed data.
- If providers degrade broadly, resilience depends on process memory snapshots only.

### Future direction
- Add persistent feed snapshot storage and controlled refresh jobs.
