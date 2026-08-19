import manifest from './projectManifest.json';

interface ValidationRuleEntry {
  file: string;
  name: string;
  id: string;
  severity: string;
  requiredTables: string[];
  entityMappings: string[];
  tactics: string[];
  techniques: string[];
  errors: string[];
  warnings: string[];
}

interface FlagshipScenario {
  rule: string;
  sample: string;
  description: string;
  status: string;
  errors: string[];
}

function normalizePath(p: string) {
  return p.replaceAll('\\', '/');
}

const validationRules = (manifest.validation?.rules ?? []) as ValidationRuleEntry[];
const flagshipScenarios = (manifest.validation?.flagshipScenarios ?? []) as FlagshipScenario[];

const byId = new Map(validationRules.map((r) => [r.id, r]));

export interface RuleEvidence {
  yamlPath: string;
  kqlPath: string;
  requiredTables: string[];
  sample?: { path: string; description: string; status: string };
}

/** Real repo paths and sample-data linkage for a rule, derived from the generated manifest. */
export function getRuleEvidence(ruleId: string, category: string, fileStem: string): RuleEvidence {
  const validated = byId.get(ruleId);
  const yamlPath = validated ? normalizePath(validated.file) : `sentinel-detection-pack/rules-yaml/${category}/${fileStem}.yaml`;
  const kqlPath = yamlPath.replace('rules-yaml', 'rules').replace(/\.yaml$/, '.kql');

  const scenario = flagshipScenarios.find((s) => yamlPath.endsWith(s.rule));
  const sample = scenario
    ? {
        path: `sentinel-detection-pack/sample-data/${scenario.sample}`,
        description: scenario.description,
        status: scenario.status,
      }
    : undefined;

  return {
    yamlPath,
    kqlPath,
    requiredTables: validated?.requiredTables ?? [],
    sample,
  };
}
