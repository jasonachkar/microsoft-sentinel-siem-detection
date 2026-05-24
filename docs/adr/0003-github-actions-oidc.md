# ADR-0003: GitHub Actions OIDC Instead of Client Secrets

Status: Accepted

## Context

CI/CD needs Azure access to validate and optionally deploy rules or run drift checks. Long-lived client secrets in GitHub increase blast radius if exposed.

## Decision

Use GitHub Actions OIDC federation and Azure `DefaultAzureCredential` / `azure/login` patterns instead of storing long-lived Azure client secrets.

## Alternatives

- GitHub Actions secrets containing client ID, tenant ID, and client secret.
- A manually operated local deployer only.
- Managed identity from a self-hosted runner.

## Tradeoffs

OIDC requires app registration and federated credential setup. That is more initial work than a static secret but reduces standing credential risk.

## Security Implications

Tokens are short-lived and scoped to workflow identity conditions. Secret rotation burden is reduced, and accidental secret disclosure risk is lower.

## Operational Implications

Workflows must document required Azure app registration, subscription, and role assignments. Misconfigured federation will fail fast in CI.

## Interview Talking Point

The pipeline is designed around short-lived federated credentials because deployment secrets are a common CI/CD failure mode.
