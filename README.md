# hello-apollo

A minimal Next.js app packaged as a Helm chart and a Palantir Apollo product
(`helm-chart.v1`). It exists to demonstrate, end-to-end, how Apollo wires three
sources of configuration into a running pod and surfaces them in the UI:

1. A Kubernetes **Secret**
2. An Apollo **module variable**
3. An Apollo **environment config** value

Deploy it to an Apollo environment, set the module variable and the
environment-config value, fill in the secret, and the page renders all three.

## Local development

```bash
nvm use            # picks up .nvmrc (Node 24)
npm install
npm run dev        # http://localhost:3000
```

The page calls `/api/hello`, which reads `NEXT_PUBLIC_VALUE_FROM_SECRET`,
`NEXT_PUBLIC_VALUE_FROM_MODULE_VARIABLE`, and
`NEXT_PUBLIC_VALUE_FROM_ENVIRONMENT_CONFIG` from `process.env`. Set them in your
shell to mimic an Apollo deployment locally.

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## How config flows from Apollo to the browser

```
hello-apollo-module.yaml         (Apollo module: vars, secrets, configOverrides)
        │
        ▼
charts/hello-apollo/values.yaml  (.Values.config.*)
        │
        ▼
templates/deployment.yaml        (injects NEXT_PUBLIC_* env vars on the pod)
        │
        ▼
src/app/api/hello/route.ts       (reads process.env, returns JSON)
        │
        ▼
src/app/page.tsx                 (fetches /api/hello, renders values)
```

Adding a new value means touching all four layers.

## Packaging & release

Three files carry the version and must stay in lockstep:

- `package.json` → `version`
- `charts/hello-apollo/Chart.yaml` → `version` and `appVersion`
- `charts/hello-apollo/deployment/manifest.yml` → `product-version`,
  `helm-chart-version`, and the image tag in `artifacts[].uri`

Pushing a git tag triggers `.github/workflows/release.yaml`, which:

1. Builds and pushes the Docker image to Docker Hub (`ucabvas/hello-apollo:<version>`).
2. Runs `helm/chart-releaser-action` to publish the chart to the `gh-pages`
   branch, served at <https://ucabvas.github.io/hello-apollo>.

The Apollo product manifest at `charts/hello-apollo/deployment/manifest.yml` is
the artifact Apollo ingests.

## Repository layout

```
src/app/                          Next.js App Router (page, layout, /api/hello route)
charts/hello-apollo/              Helm chart
  ├─ templates/                   Deployment, Service, Ingress, etc.
  └─ deployment/manifest.yml      Apollo product manifest
hello-apollo-module.yaml          Apollo module spec (variables, secrets, overrides)
Dockerfile                        Multi-stage build, runs Next standalone output
.github/workflows/release.yaml    Tag-driven image + chart release
```
