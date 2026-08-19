/**
 * Extra curated narrative for detections that warrant deeper case-study
 * content than the generic template can generate from rule metadata alone.
 * Only the flagship (Entra ID Password Spray) has an entry today; every
 * other rule still gets the full section-14 template from its own metadata.
 */
export interface DetectionNarrative {
  tuningParams: { param: string; value: string; rationale: string }[];
  falsePositives: { source: string; detail: string; mitigation: string }[];
  runbook: string[];
  tradeoffs: string[];
}

export const detectionNarratives: Record<string, DetectionNarrative> = {
  '0710c724-a738-4b0f-af52-947ba4f01c0d': {
    tuningParams: [
      { param: 'MinDistinctAccounts', value: '8', rationale: 'Spray is wide-and-shallow. Distinct accounts is the strongest spray signal vs. a single-account brute force.' },
      { param: 'MinFailures', value: '20', rationale: 'Volume floor per 15-min bin from one source/app. Raise in noisy tenants, lower for high-value apps.' },
      { param: 'BinSize', value: '15m', rationale: 'Short enough to catch bursts, long enough to aggregate a slow spray. Pair with QueryFrequency PT5M for overlap.' },
      { param: 'ResultType filter', value: '50126, 50125, 50053, 50055, 50057', rationale: 'Invalid credentials, locked, disabled, expired — the outcomes a spray actually produces. Excludes benign MFA prompts.' },
      { param: 'AllowedIPs', value: 'dynamic([])', rationale: 'Allowlist corporate egress / VPN concentrators that legitimately generate bulk failures.' },
    ],
    falsePositives: [
      { source: 'VPN / NAT egress', detail: 'Many users behind one corporate IP can look like one source spraying many accounts.', mitigation: 'Add the egress range to AllowedIPs; pivot on AppDisplayName + UserAgent.' },
      { source: 'Misconfigured app / cached creds', detail: 'A service or device replaying stale credentials drives failures for one account, not many.', mitigation: 'DistinctAccounts >= 8 already filters single-account noise.' },
      { source: 'Load / pen tests', detail: 'Authorized testing generates spray-shaped telemetry.', mitigation: 'Allowlist the test source and coordinate change windows.' },
      { source: 'Legacy auth protocols', detail: 'Basic-auth clients fail in bursts after a password change.', mitigation: 'Correlate ClientAppUsed; drive toward blocking legacy auth via Conditional Access.' },
    ],
    runbook: [
      'Confirm the source IP is not a known corporate egress; enrich with threat intel and geo.',
      'Pull the targeted account set; check whether any sign-in later succeeded from the same IP (spray → success = compromise).',
      'Force password reset + revoke sessions for any account with a subsequent success.',
      'Trigger the SOAR playbook to block the IP and require step-up MFA for targeted users.',
      'If success occurred, escalate to incident and scope blast radius across the targeted account set.',
    ],
    tradeoffs: [
      'Low thresholds catch attacks earlier but create false positives behind NAT or proxy infrastructure.',
      'Ingestion delay means a scheduled rule may not fire immediately after the last failed sign-in.',
      'Trusted egress IP allowlists need ownership and periodic review.',
      'User agent and client app fields help triage but should not be the only decision point.',
    ],
  },
};
