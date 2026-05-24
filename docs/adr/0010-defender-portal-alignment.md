# ADR-0010: Defender Portal Alignment

Status: Accepted

## Context

Microsoft Sentinel is available in the Microsoft Defender portal, and Microsoft has announced the transition away from Azure-portal-only Sentinel workflows.

## Decision

Describe the operating model as Sentinel / Defender portal-aware. Keep Azure resource/IaC references where appropriate, but do not position the workflow as Azure-portal-only.

## Alternatives

- Keep all docs Azure portal-specific.
- Rename everything to Defender and hide Sentinel terminology.
- Avoid portal discussion entirely.

## Tradeoffs

Some tenants still use Azure portal experiences, so docs must map both paths without sounding outdated.

## Security Implications

Defender portal alignment keeps incident, hunting, automation, and content-hub terminology current for Microsoft security operations.

## Operational Implications

Evidence screenshots may come from Azure portal or Defender portal depending on tenant setup. Both should be sanitized before commit.

## Interview Talking Point

I am aware that Sentinel operations are moving into the Defender portal and documented the mapping rather than assuming the old portal is the only workflow.
