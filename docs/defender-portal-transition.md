# Microsoft Sentinel and Defender Portal Alignment

Microsoft Sentinel is generally available in the Microsoft Defender portal. Microsoft Learn states that after March 31, 2027, Microsoft Sentinel will no longer be supported in the Azure portal and will be available only in the Microsoft Defender portal.

Source: <https://learn.microsoft.com/azure/sentinel/microsoft-sentinel-defender-portal>

## Why This Lab Mentions Defender Portal

This project still uses Microsoft Sentinel terminology because the detection content is Sentinel analytics rule content. The operational reviewer story should be Defender-portal-aware because incidents, hunting, analytics, automation, and content management are moving into the unified Defender experience.

## Navigation Mapping

| Security task | Defender portal location | Notes |
| --- | --- | --- |
| Incidents | Incident queue / Investigation and response | Unified SIEM/XDR investigation workflow |
| Hunting / Advanced Hunting | Investigation and response > Hunting > Advanced hunting | KQL hunting experience across available tables |
| Analytics rules | Microsoft Sentinel > Configuration > Analytics | Scheduled rule configuration and management |
| Automation / playbooks | Microsoft Sentinel > Configuration > Automation | Automation rules and Logic Apps playbook linkage |
| Content hub | Microsoft Sentinel > Content management > Content hub | Solution and content lifecycle |
| Workbooks | Microsoft Sentinel / monitoring experiences | Location can vary by tenant and portal experience |
| MITRE ATT&CK | Microsoft Sentinel and Defender investigation views | Used for tactic/technique coverage discussion |

## Evidence Guidance

Screenshots may come from either Azure portal or Defender portal depending on tenant setup and timing. Prefer Defender portal screenshots for new evidence where possible.

## Current Lab Status

The UI and README describe the workflow as Sentinel / Defender portal-aware. This does not mean a live Defender tenant is continuously running.
