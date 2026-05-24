export const projectLimitations = [
  {
    id: 'demo-telemetry',
    title: 'Some UI telemetry is simulated',
    status: 'limitation',
    summary: 'Demo data keeps the reviewer flow populated without running a paid lab continuously.',
  },
  {
    id: 'mock-detection-assertion',
    title: 'Detection assertion is mock/local by default',
    status: 'limitation',
    summary: 'The assertion script does not currently prove that a deployed Sentinel alert fired.',
  },
  {
    id: 'no-production-sla',
    title: 'No production SLA or SOC certification',
    status: 'limitation',
    summary: 'This is a portfolio lab, not a SOC 2/ISO certified service or MDR product.',
  },
  {
    id: 'soar-approval-needed',
    title: 'SOAR containment requires approval controls',
    status: 'limitation',
    summary: 'Containment should stay human-approved until target scoping, rollback, and run history are tested.',
  },
  {
    id: 'public-feed-fragility',
    title: 'Public threat feeds can fail in-browser',
    status: 'limitation',
    summary: 'Browser/CORS behavior can force the threat map to use representative demo data.',
  },
];
