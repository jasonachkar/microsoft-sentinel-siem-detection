import fs from 'fs';
import path from 'path';

const uiRoot = path.resolve(process.cwd());
const repoRoot = path.resolve(uiRoot, '..');
const bundlePath = path.join(repoRoot, 'bundles', 'sentinel-rules-bundle.json');
const rulesDir = path.join(repoRoot, 'rules');
const outPath = path.join(uiRoot, 'src', 'data', 'rules.json');

const requiredHeaderFields = [
  'RuleId',
  'Name',
  'Category',
  'Severity',
  'Tactics',
  'Techniques',
  'DataSources',
  'QueryFrequency',
  'QueryPeriod',
  'TriggerOperator',
  'TriggerThreshold',
  'Version',
  'Author',
  'Status',
  'Description',
  'FalsePositives'
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function parseMetadataBlock(content) {
  const start = content.indexOf('/*');
  const end = content.indexOf('*/', start + 2);
  if (start === -1 || end === -1) {
    return null;
  }
  const block = content.slice(start + 2, end).trim();
  const lines = block.split(/\r?\n/);
  const data = {};
  for (const line of lines) {
    const match = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (match) {
      data[match[1]] = match[2].trim();
    }
  }
  return data;
}

function splitList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function collectKqlMetadata(dirPath, out = {}) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectKqlMetadata(fullPath, out);
      continue;
    }
    if (!entry.name.endsWith('.kql')) {
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    const meta = parseMetadataBlock(content);
    if (!meta) {
      continue;
    }
    const missing = requiredHeaderFields.filter((field) => !meta[field]);
    if (missing.length > 0) {
      continue;
    }
    out[meta.RuleId] = {
      id: meta.RuleId,
      name: meta.Name,
      category: meta.Category,
      severity: meta.Severity,
      tactics: splitList(meta.Tactics),
      techniques: splitList(meta.Techniques),
      dataSources: splitList(meta.DataSources),
      queryFrequency: meta.QueryFrequency,
      queryPeriod: meta.QueryPeriod,
      triggerOperator: meta.TriggerOperator,
      triggerThreshold: meta.TriggerThreshold,
      version: meta.Version,
      author: meta.Author,
      status: meta.Status,
      description: meta.Description,
      falsePositives: meta.FalsePositives
    };
  }
  return out;
}

if (!fs.existsSync(bundlePath)) {
  console.error(`Missing bundle at ${bundlePath}. Run ../scripts/bundle-rules.sh first.`);
  process.exit(1);
}

const bundle = readJson(bundlePath);
const bundleRules = Array.isArray(bundle.rules) ? bundle.rules : [];
const metadataById = collectKqlMetadata(rulesDir);

// Domain is authoritatively the rules-yaml/<domain>/ folder name, since every
// rule lives under exactly one domain folder. Built directly from the YAML
// source rather than the .kql header cross-reference, which can miss rules
// whose id doesn't line up between the two parallel formats.
const rulesYamlDir = path.join(repoRoot, 'rules-yaml');
function collectDomainById(dirPath, out = {}) {
  if (!fs.existsSync(dirPath)) return out;
  for (const domain of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (!domain.isDirectory()) continue;
    const domainPath = path.join(dirPath, domain.name);
    for (const file of fs.readdirSync(domainPath)) {
      if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue;
      const content = fs.readFileSync(path.join(domainPath, file), 'utf-8');
      const idMatch = content.match(/^id:\s*(.+)$/m);
      if (idMatch) out[idMatch[1].trim()] = domain.name;
    }
  }
  return out;
}
const domainById = collectDomainById(rulesYamlDir);

const merged = bundleRules.map((rule) => {
  const meta = metadataById[rule.id] || {};
  const requiredDataConnectors = rule.requiredDataConnectors || [];
  const connectors = requiredDataConnectors.map((c) => c.connectorId).filter(Boolean);
  const dataTypes = requiredDataConnectors
    .flatMap((c) => c.dataTypes || [])
    .filter(Boolean);
  return {
    id: rule.id,
    name: rule.name || meta.name,
    description: rule.description || meta.description,
    severity: rule.severity || meta.severity,
    tactics: rule.tactics || meta.tactics || [],
    techniques: rule.techniques || meta.techniques || [],
    queryFrequency: rule.queryFrequency || meta.queryFrequency,
    queryPeriod: rule.queryPeriod || meta.queryPeriod,
    triggerOperator: rule.triggerOperator || meta.triggerOperator,
    triggerThreshold: rule.triggerThreshold || meta.triggerThreshold,
    category: domainById[rule.id] || meta.category || 'unknown',
    dataSources: meta.dataSources || [],
    connectors,
    dataTypes,
    entityMappings: rule.entityMappings || [],
    status: rule.status || meta.status || 'Production',
    falsePositives: meta.falsePositives || 'Review and tune for environment',
    query: rule.query || ''
  };
});

const payload = {
  generatedAt: new Date().toISOString(),
  total: merged.length,
  rules: merged
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8');
console.log(`Wrote ${outPath}`);

// ---------------------------------------------------------------------------
// Infrastructure source bundle for the IaC Explorer UI.
// Reads the REAL Terraform / workflow / Go / Python source from the repo root so
// the dashboard showcases the actual committed infrastructure, not a mock-up.
// ---------------------------------------------------------------------------
const gitRoot = path.resolve(uiRoot, '..', '..');
const infraOutPath = path.join(uiRoot, 'src', 'data', 'infra-source.json');

const sourceManifest = [
  { path: 'terraform/providers.tf', group: 'Azure Sentinel Core', language: 'hcl', deploys: 'Log Analytics workspace + Sentinel (SecurityInsights), remote azurerm state backend.' },
  { path: 'terraform/variables.tf', group: 'Azure Sentinel Core', language: 'hcl', deploys: 'Workspace name, region, and 90-day retention inputs.' },
  { path: 'terraform/main.tf', group: 'Azure Sentinel Core', language: 'hcl', deploys: 'Resource group, Log Analytics workspace, SecurityInsights solution.' },
  { path: 'terraform/outputs.tf', group: 'Azure Sentinel Core', language: 'hcl', deploys: 'Workspace and resource IDs consumed by downstream modules.' },
  { path: 'terraform-aws-connector/main.tf', group: 'AWS CloudTrail Connector', language: 'hcl', deploys: 'KMS-encrypted CloudTrail S3 bucket, public-access block, OIDC AssumeRole for cross-cloud ingestion.' },
  { path: 'terraform-soar/main.tf', group: 'SOAR Logic Apps', language: 'hcl', deploys: 'Isolate-host Logic App with system-assigned identity, RG-scoped Network Contributor (least privilege).' },
  { path: 'terraform-honeypot/main.tf', group: 'Ephemeral Honeypot', language: 'hcl', deploys: 'Throwaway Windows VM + network, credential generated at apply time (never committed).' },
  { path: 'terraform-policy/main.tf', group: 'Azure Policy (Prevention)', language: 'hcl', deploys: 'Custom deny/audit policy definitions + Microsoft Cloud Security Benchmark initiative assignment.' },
  { path: '.github/workflows/sentinel-ci-cd.yaml', group: 'CI/CD Pipeline', language: 'yaml', deploys: 'Shift-left scans (Gitleaks/TFSec/Trivy), rule validation, Atomic Red Team assertion, OIDC deploy.' },
  { path: '.github/workflows/drift-detection.yaml', group: 'CI/CD Pipeline', language: 'yaml', deploys: 'Nightly terraform plan -detailed-exitcode against remote state; opens an incident issue on drift.' },
  { path: 'src-cli/main.go', group: 'Go Deployment CLI', language: 'go', deploys: 'CLI entrypoint: walks YAML rules, dry-run by default, -apply pushes to Sentinel.' },
  { path: 'src-cli/deployer.go', group: 'Go Deployment CLI', language: 'go', deploys: 'Maps YAML detections to ARM ScheduledAlertRule and calls AlertRulesClient.CreateOrUpdate.' },
  { path: 'scripts/assert-detection.py', group: 'Detection-as-Code', language: 'python', deploys: 'Asserts detections fire against Atomic Red Team sample telemetry in CI.' },
  { path: 'scripts/threat-intel-ingest.py', group: 'Detection-as-Code', language: 'python', deploys: 'Scheduled threat-intel indicator ingestion pipeline.' },
];

const infraFiles = [];
for (const entry of sourceManifest) {
  const fullPath = path.join(gitRoot, entry.path);
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    infraFiles.push({
      id: entry.path,
      label: path.basename(entry.path),
      ...entry,
      lines: content.split(/\r?\n/).length,
      bytes: Buffer.byteLength(content, 'utf-8'),
      content,
    });
  } catch (e) {
    console.warn(`infra-source: skipped missing file ${entry.path}`);
  }
}

const infraPayload = {
  generatedAt: new Date().toISOString(),
  totalFiles: infraFiles.length,
  totalLines: infraFiles.reduce((sum, f) => sum + f.lines, 0),
  modules: [...new Set(infraFiles.map((f) => f.group))].length,
  files: infraFiles,
};

fs.writeFileSync(infraOutPath, JSON.stringify(infraPayload, null, 2), 'utf-8');
console.log(`Wrote ${infraOutPath} (${infraFiles.length} files)`);

// ---------------------------------------------------------------------------
// Project manifest: counts and indexes generated from real repo files, so the
// UI never hand-maintains numbers that can drift from the source of truth.
// ---------------------------------------------------------------------------
const manifestOutPath = path.join(uiRoot, 'src', 'data', 'projectManifest.json');

function countFiles(dirPath, predicate) {
  if (!fs.existsSync(dirPath)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      count += countFiles(fullPath, predicate);
    } else if (predicate(entry.name)) {
      count += 1;
    }
  }
  return count;
}

function countDirFiles(dirPath, predicate) {
  if (!fs.existsSync(dirPath)) return 0;
  return fs.readdirSync(dirPath).filter(predicate).length;
}

function parseAdrFrontMatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const idMatch = content.match(/^#\s*(ADR-\d+):\s*(.+)$/m);
  const statusMatch = content.match(/^Status:\s*(.+)$/m);
  return {
    id: idMatch ? idMatch[1] : path.basename(filePath),
    title: idMatch ? idMatch[2].trim() : path.basename(filePath),
    status: statusMatch ? statusMatch[1].trim() : 'Unknown',
    file: path.relative(gitRoot, filePath).split(path.sep).join('/'),
  };
}

const workflowsDir = path.join(gitRoot, '.github', 'workflows');
const workflowCount = countDirFiles(workflowsDir, (f) => f.endsWith('.yml') || f.endsWith('.yaml'));

const terraformDirs = [
  'terraform',
  'terraform-aws-connector',
  'terraform-honeypot',
  'terraform-policy',
  'terraform-soar',
];
const terraformModuleCount = terraformDirs.filter((d) => fs.existsSync(path.join(gitRoot, d))).length;

const adrDir = path.join(gitRoot, 'docs', 'adr');
const adrFiles = fs.existsSync(adrDir)
  ? fs
      .readdirSync(adrDir)
      .filter((f) => /^\d{4}-.*\.md$/.test(f))
      .sort()
      .map((f) => parseAdrFrontMatter(path.join(adrDir, f)))
  : [];

function countEvidenceFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return { total: 0, real: 0 };
  const files = fs.readdirSync(dirPath).filter((f) => f !== '.gitkeep');
  return { total: files.length, real: files.filter((f) => !f.includes('.example.')).length };
}

const evidenceIndex = {
  azure: countEvidenceFiles(path.join(gitRoot, 'evidence', 'azure')),
  defender: countEvidenceFiles(path.join(gitRoot, 'evidence', 'defender')),
  github: countEvidenceFiles(path.join(gitRoot, 'evidence', 'github')),
  ui: countEvidenceFiles(path.join(gitRoot, 'evidence', 'ui')),
};

let validationReport = null;
const validationReportPath = path.join(gitRoot, 'docs', 'detection-engineering', 'detection-validation-report.json');
if (fs.existsSync(validationReportPath)) {
  try {
    validationReport = readJson(validationReportPath);
  } catch {
    validationReport = null;
  }
}

const ruleDomains = {};
for (const rule of merged) {
  const domain = rule.category || 'unknown';
  ruleDomains[domain] = (ruleDomains[domain] || 0) + 1;
}

const manifest = {
  generatedAt: new Date().toISOString(),
  rules: {
    total: merged.length,
    byDomain: ruleDomains,
  },
  terraform: {
    modules: terraformModuleCount,
    moduleNames: terraformDirs,
  },
  workflows: {
    total: workflowCount,
  },
  adrs: adrFiles,
  evidence: evidenceIndex,
  validation: validationReport,
};

fs.writeFileSync(manifestOutPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`Wrote ${manifestOutPath} (${merged.length} rules, ${workflowCount} workflows, ${terraformModuleCount} terraform modules, ${adrFiles.length} ADRs)`);
