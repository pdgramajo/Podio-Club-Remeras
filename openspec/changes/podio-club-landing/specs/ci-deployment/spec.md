# CI & Deployment Specification

## Purpose

Defines the continuous integration pipeline (lint, test, build) and the GitHub Pages deployment flow, including the SPA fallback that keeps deep links (`/producto/:id`) working on refresh. Deployment is purely git-driven: pushing to `main` rebuilds and redeploys the site.

## Requirements

### Requirement: Workflow triggers and job structure

The system MUST include a GitHub Actions workflow (`.github/workflows/deploy.yml`) that runs on push to `main` and MAY run on workflow dispatch. The workflow MUST install dependencies with a pinned Node.js version, run lint, run the test suite, and produce the production build; a failure in any of these steps MUST stop the job before deployment.

#### Scenario: Green push deploys

- GIVEN a push to `main` whose lint, tests, and build all pass
- WHEN the workflow runs
- THEN the job completes successfully through lint, test, and build
- AND the build artifact proceeds to deployment (see Requirement: GitHub Pages deployment)

#### Scenario: Failing lint blocks deploy

- GIVEN a push to `main` where lint fails
- WHEN the workflow runs
- THEN the job fails at the lint step
- AND no deployment occurs

#### Scenario: Failing tests block deploy

- GIVEN a push to `main` where a test fails
- WHEN the workflow runs
- THEN the job fails at the test step
- AND no deployment occurs

### Requirement: GitHub Pages deployment

The workflow MUST deploy the production build to GitHub Pages using the official actions `actions/upload-pages-artifact` and `actions/deploy-pages`, with `permissions` set to `contents: read`, `pages: write`, and `id-token: write`. The repository's Pages source MUST be configured to "GitHub Actions" (documented for the repository owner). The build MUST use a Vite `base` path matching the repository name so assets resolve under the Pages subpath (e.g. `https://<owner>.github.io/<repo>/`).

#### Scenario: Deployment artifact upload

- GIVEN a successful lint, test, and build on `main`
- WHEN the deployment steps run
- THEN the build output is uploaded as a Pages artifact
- AND `deploy-pages` publishes it to the Pages URL
- AND the workflow grants exactly `contents: read`, `pages: write`, and `id-token: write`

#### Scenario: Asset base path

- GIVEN the deployed site at `https://<owner>.github.io/<repo>/`
- WHEN the site loads
- THEN all JavaScript, CSS, and image assets referenced by the document resolve under the `<repo>` base path
- AND no asset request fails with a missing subpath prefix

### Requirement: SPA 404 fallback

The build step MUST produce a `404.html` file in the build output that is a copy of the built `index.html` (the SPA shell). Because GitHub Pages serves `404.html` for unknown paths, a direct load or refresh of a client-side route (e.g. `/producto/1`) MUST return the SPA shell instead of a GitHub 404 page, letting the client-side router render the correct page.

#### Scenario: Deep link survives refresh

- GIVEN the deployed site
- WHEN the user loads `/producto/1` directly (refresh or shared link)
- THEN the server responds with the SPA shell (served via `404.html`)
- AND the page renders the product detail route without a routing error

#### Scenario: Artifact contains the fallback

- GIVEN a completed production build
- WHEN the build output directory is inspected
- THEN it contains both `index.html` and a `404.html` whose content is the SPA shell

### Requirement: Pipeline verification of the artifact

The workflow SHOULD verify the built artifact before deployment: asserting that `index.html`, `404.html`, and the bundled assets exist and that the 404 fallback content matches the SPA shell, so a broken build can never reach Pages.

#### Scenario: Broken artifact fails before deploy

- GIVEN a build whose output is missing `404.html` or the bundled assets
- WHEN the verification step runs
- THEN the job fails
- AND no deployment occurs

### Requirement: Node.js version pinning

The workflow MUST pin a concrete Node.js version in its `setup-node` step, matching the `engines` field of `package.json`, so build and test behavior is reproducible between CI and developer machines.

#### Scenario: Pinned runtime

- GIVEN the repository's workflow file and `package.json`
- WHEN both are inspected
- THEN the `setup-node` step pins a concrete Node.js major version
- AND that version matches the `engines` field of `package.json`
