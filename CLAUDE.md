# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A minimal Next.js 16 (App Router, React 19, Tailwind 4) demo app packaged as **a Helm chart and an Apollo product (`helm-chart.v1`)** for deployment to Palantir Apollo. The app's purpose is to demonstrate how Apollo wires three sources of configuration into a running pod and surfaces them in the UI:

1. A Kubernetes **Secret** (`NEXT_PUBLIC_VALUE_FROM_SECRET`)
2. An Apollo **module variable** (`NEXT_PUBLIC_VALUE_FROM_MODULE_VARIABLE`)
3. An Apollo **environment config** value (`NEXT_PUBLIC_VALUE_FROM_ENVIRONMENT_CONFIG`)

## Common commands

```bash
npm run dev      # next dev --turbopack (http://localhost:3000)
npm run build    # next build → produces .next/standalone (output: "standalone")
npm run start    # next start (production)
npm run lint     # next lint
```

Docker build mirrors CI:
```bash
docker build --tag ucabvas/hello-apollo:<ver> \
  --build-arg IMAGE_VERSION=<ver> \
  --build-arg IMAGE_CREATE_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --build-arg IMAGE_SOURCE_REVISION="$(git rev-parse HEAD)" .
```

Helm chart sanity check: `helm lint charts/hello-apollo && helm template charts/hello-apollo`.

## Architecture: how a value travels from Apollo to the browser

This is the core flow to understand before touching anything:

1. **`hello-apollo-module.yaml`** — Apollo module spec. Declares the module's variables and secret requirements, and maps them into Helm `configOverrides` (keyed by chart version, e.g. `"0.0.9":`). The `valueFromModuleVariable`, `valueFromSecret`, and `valueFromEnvironmentConfig` keys here line up with `.Values.config.*` in the chart.
2. **`charts/hello-apollo/values.yaml`** + **`templates/deployment.yaml`** — the Deployment reads `.Values.config.*` and injects them as `NEXT_PUBLIC_*` env vars on the container. The secret is pulled via `secretKeyRef`; the other two are plain values.
3. **`src/app/api/hello/route.ts`** — server route that reads `process.env.NEXT_PUBLIC_*` and returns them as JSON. Because these are read at request time on the server, **runtime values reach the client without rebuilding the image**.
4. **`src/app/page.tsx`** — client component fetches `/api/hello` on mount and renders the values.

When changing what the app displays, you almost always need to touch all four layers — adding a name in one place without the others is the common mistake.

## Versioning & release

Three files carry the version and **must stay in lockstep**:

- `package.json` → `version`
- `charts/hello-apollo/Chart.yaml` → `version` and `appVersion`
- `charts/hello-apollo/deployment/manifest.yml` → `product-version`, `helm-chart-version`, and the image tag in `artifacts[].uri`

The Helm template hardcodes the image as `docker.io/ucabvas/hello-apollo:{{ .Chart.AppVersion }}`, so `appVersion` is the image tag.

Release is triggered by pushing a git tag (`.github/workflows/release.yaml`):
- Builds + pushes the Docker image to Docker Hub (`ucabvas/hello-apollo:<version>` from `package.json`).
- Runs `helm/chart-releaser-action` to publish the chart to the `gh-pages` branch served at `https://ucabvas.github.io/hello-apollo`.

The Apollo product manifest at `charts/hello-apollo/deployment/manifest.yml` is what Apollo ingests; a stray `manifest.yml` at repo root (older version, untracked) is **not** the canonical one — don't confuse them.

## Notes & gotchas

- `next.config.ts` sets `output: "standalone"`. The Dockerfile relies on this — it copies `.next/standalone` and `.next/static` into the runner stage and runs `node server.js`. Don't remove the standalone output without updating the Dockerfile.
- `entrypoint.sh` exists in the repo but is **not invoked** by the Dockerfile (CMD is `node server.js` directly). It's a leftover build-time sed-substitution approach; the API-route approach in `src/app/api/hello/route.ts` replaced it. Leave it alone unless you're cleaning up.
- The `NEXT_PUBLIC_` prefix is a Next.js convention for client-exposed env vars, but here the values are actually read server-side in the API route, so the prefix is cosmetic — renaming requires updates in the chart template, the API route, and `hello-apollo-module.yaml`.
- `configOverrides` in `hello-apollo-module.yaml` is keyed by chart version (currently `"0.0.9":`). When bumping the chart in a way that changes how `.Values.config.*` are consumed, add a new version block rather than mutating the existing one — Apollo applies the override that matches the deployed chart version.
