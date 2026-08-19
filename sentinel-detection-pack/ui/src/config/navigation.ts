import type { LucideIcon } from 'lucide-react';
import {
  Compass,
  Network,
  ShieldHalf,
  GitPullRequestArrow,
  FolderCheck,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  keywords: string;
}

/** Primary navigation: five internal destinations plus the external GitHub link. */
export const primaryNav: NavItem[] = [
  { path: '/', label: 'Overview', icon: Compass, keywords: 'home overview mission proof' },
  { path: '/architecture', label: 'Architecture', icon: Network, keywords: 'topology terraform iac trust boundaries oidc adr' },
  { path: '/detections', label: 'Detections', icon: ShieldHalf, keywords: 'kql rules catalog mitre password spray' },
  { path: '/operations', label: 'Delivery & Response', icon: GitPullRequestArrow, keywords: 'ci cd pipeline drift soar automation playbook' },
  { path: '/evidence', label: 'Evidence', icon: FolderCheck, keywords: 'proof validated simulated status scope' },
];

export const GITHUB_URL = 'https://github.com/jasonachkar/microsoft-sentinel-siem-detection';

/**
 * Experimental / demo pages, kept for technical value but demoted out of the
 * primary reviewer path per the redesign brief. Reachable via the footer
 * "Lab sandbox" link and the command palette, never from primary nav or
 * primary-page content.
 */
export const labNav: NavItem[] = [
  { path: '/lab', label: 'Lab sandbox index', icon: Compass, keywords: 'lab demo sandbox index' },
  { path: '/lab/dashboard', label: 'Lab dashboard', icon: Compass, keywords: 'demo dashboard summary' },
  { path: '/lab/command-center', label: 'Lab command center', icon: Compass, keywords: 'demo command center' },
  { path: '/lab/threat-map', label: 'Demo threat map', icon: Compass, keywords: 'demo threat map ioc' },
  { path: '/lab/incidents', label: 'Demo incidents', icon: Compass, keywords: 'demo incidents queue' },
  { path: '/lab/live-incidents', label: 'Demo live incidents (API)', icon: Compass, keywords: 'demo live incidents api' },
  { path: '/lab/investigation', label: 'Demo investigation graph', icon: Compass, keywords: 'demo investigation entity graph' },
  { path: '/lab/kql', label: 'KQL simulator', icon: Compass, keywords: 'kql simulator local demo not live kusto' },
  { path: '/lab/metrics', label: 'Demo metrics', icon: Compass, keywords: 'demo metrics dashboard' },
  { path: '/lab/simulator', label: 'Attack simulator', icon: Compass, keywords: 'attack simulator demo' },
  { path: '/lab/copilot', label: 'Copilot concept demo', icon: Compass, keywords: 'copilot concept demo genai' },
  { path: '/lab/kubernetes', label: 'Demo K8s telemetry', icon: Compass, keywords: 'demo kubernetes telemetry' },
  { path: '/lab/mitre', label: 'MITRE ATT&CK navigator', icon: Compass, keywords: 'mitre attack navigator coverage' },
  { path: '/lab/tutorial', label: 'Learning paths', icon: Compass, keywords: 'tutorial learning paths' },
  { path: '/lab/posture', label: 'IaC posture demo', icon: Compass, keywords: 'demo posture resource graph' },
  { path: '/lab/live-posture', label: 'Live posture (API)', icon: Compass, keywords: 'live posture api' },
  { path: '/lab/infrastructure', label: 'Infrastructure posture demo', icon: Compass, keywords: 'demo infrastructure posture' },
  { path: '/lab/finops', label: 'Security FinOps demo', icon: Compass, keywords: 'finops cost demo' },
];

export const allCommands: NavItem[] = [...primaryNav, ...labNav];
