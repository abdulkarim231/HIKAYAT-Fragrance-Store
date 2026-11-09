---
name: Clean deployment validation
description: Why successful builds in a warm workspace may fail on a fresh deployment host.
---

Validate standalone storefront builds without relying on previously emitted shared-library declarations.

**Why:** A local production build passed with ignored declarations already present, while Vercel failed with TS6305 because its fresh checkout lacked those outputs.

**How to apply:** When changing workspace references or build orchestration, clean the relevant referenced projects' generated outputs using TypeScript's build-clean command, then run the storefront's own build as a deployment host would. Keep TypeScript checks enabled; do not commit generated declarations just to hide missing build prerequisites.
