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
