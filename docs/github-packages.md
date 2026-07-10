# GitHub Packages distribution

The six `@defend-tech/presidio-*` packages publish only to the GitHub Packages
npm registry at `https://npm.pkg.github.com`. They are publishable packages, so
their manifests deliberately do **not** set `private: true`; that npm field
prevents publication and does not control GitHub Packages visibility.

## Repository and package visibility

The npm registry has granular package permissions: a package's visibility and
access are separate from the visibility of `defend-tech/presidio-ts`. The first
publish is private. Treat that first publication as a provisioning operation:
an organization owner must review each package page before distributing it.

Do not make a package public as a temporary test. A GitHub Packages npm package
made public cannot be made private again. If a package must stay private, set
the intended package/team permissions while it remains private.

The manifests link packages to this repository. GitHub can automatically
inherit repository access for a package linked before its first publish, unless
the organization disables that behavior; inheritance is access, not package
visibility. For external consumers, repository access alone is not a supported
package entitlement: add the user to the organization and grant access through
the package or an organization team. Review the package page's inherited or
granular access settings for every package.

This repository is public. Do not grant package read or write access to
untrusted Actions, including workflows triggered from forks. The publish job is
manual-only, uses the protected `github-packages` environment, and must never
be adapted to run for pull requests or fork events.

## Install from a consumer project

Create a classic personal access token with `read:packages`. The token owner
must be an organization member with package access directly or through a team;
repository access alone is insufficient for an external consumer. Store the
token in the consumer's secret manager or CI secret, never in source control.

```sh
cat >> .npmrc <<'EOF'
@defend-tech:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
EOF

export NODE_AUTH_TOKEN=github_pat_replace_me
npm install @defend-tech/presidio-analyzer @defend-tech/presidio-anonymizer
```

The scope mapping leaves all unscoped and other scoped dependencies on the
default npmjs registry. The committed root `.npmrc` intentionally contains only
that future remote `@defend-tech` mapping; it contains no authentication line.
For a consumer or CI, add the shown registry-specific authentication line only
in its local/user config or secret-generated CI config. Never add a token to the
repository `.npmrc`.

For a CI workflow consuming packages, configure the same scope mapping and
provide a token with `read:packages`. A workflow `GITHUB_TOKEN` can read a
package only when that repository has been granted package access and the
organization policy permits it.

## Publish from this repository

The manual `Publish TypeScript Packages` workflow is protected by the
`github-packages` environment. Dispatchers must type the exact confirmation
`PUBLISH_PRIVATE_PACKAGES` and supply the full selected source SHA; the workflow
records the ref/SHA and rejects a checkout that differs from either value.
Repository administrators must configure the `github-packages` environment's
required reviewers and deployment restrictions in GitHub; declaring the
environment in the workflow does not create those protection rules.

It validates the release, packs all six archives, and preflights **every**
name/version with the ephemeral `GITHUB_TOKEN` before any publish command. An
explicit npm `E404` is treated as absent. Authentication, authorization,
network, malformed-metadata, and other lookup errors stop the run rather than
being treated as an absent version. It then publishes in dependency order using
the exact preflight-packed archives. The token is available to both registry
metadata lookups and publish commands, but is never printed.

By default any existing version fails the preflight. `resume_existing` is an
explicit manual recovery path: it skips only an existing name/version whose
registry metadata has the exact same `dist.integrity` as the locally packed
archive; any mismatched or incomplete metadata fails. This prevents accidental
collision continuation but does not make publication atomic. If a partial run
cannot be safely resumed, bump all package versions and begin a new release.
Publishing is deliberately not triggered by pushes, tags, releases, pull
requests, or forks.

Before manually dispatching the workflow, verify the six versions, package
ownership, organization package policy, protected-environment approvers, and
post-publication visibility/access configuration. The currently authenticated
local `gh` CLI token lacks `read:packages`, so local registry state is
unverified. The workflow's `GITHUB_TOKEN` can inspect and publish packages for
this repository only when the organization policy permits it. GitHub registry
versions cannot be republished after a name/version collision.

After publication, perform an authenticated install smoke from a fresh consumer
directory using the intended package-access token and import the installed
packages. Do not consider the release complete until this smoke succeeds.

## Extension integration

Install these packages during the extension build in a trusted CI or developer
environment. Do not put a GitHub token in an extension source file, `.npmrc`
that is bundled or copied to the artifact, extension manifest, build output, or
browser runtime. The built extension contains only the resolved JavaScript;
GitHub Packages authentication is a build-time concern.
