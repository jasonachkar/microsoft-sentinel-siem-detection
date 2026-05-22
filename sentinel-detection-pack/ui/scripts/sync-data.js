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
    category: meta.category || 'unknown',
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
