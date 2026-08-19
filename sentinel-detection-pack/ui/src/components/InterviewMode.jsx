import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { fiveMinutePath } from '../data/reviewerJourney';

const skills = [
  {
    skill: 'Microsoft Sentinel',
    evidence: 'Scheduled analytics rules, incident workflow, Defender portal alignment',
    repoPath: 'sentinel-detection-pack/rules-yaml/',
    uiPage: '/detections',
    talkingPoint: 'I can explain rule metadata, incidents, automation, and Defender portal workflow.',
  },
  {
    skill: 'KQL',
    evidence: 'Password spray, Key Vault, AKS, CloudTrail, M365, and identity detections',
    repoPath: 'sentinel-detection-pack/rules/',
    uiPage: '/detections/0710c724-a738-4b0f-af52-947ba4f01c0d',
    talkingPoint: 'I tune detections with thresholds, allowlists, schema assumptions, and false-positive notes.',
  },
  {
    skill: 'Terraform',
    evidence: 'Sentinel core, honeypot, SOAR, AWS connector, Azure Policy modules',
    repoPath: 'terraform*/',
    uiPage: '/architecture',
    talkingPoint: 'I use IaC so cloud security controls can be reviewed, scanned, and reproduced.',
  },
  {
    skill: 'Azure security',
    evidence: 'Log Analytics, Sentinel, Azure Policy, diagnostic logging design, OIDC',
    repoPath: 'docs/cloud-security-controls.md',
    uiPage: '/architecture',
    talkingPoint: 'I connect prevention, logging, detection, response, identity, and cost.',
  },
  {
    skill: 'AWS security logging',
    evidence: 'CloudTrail connector, S3 hardening, KMS, external ID trust model',
    repoPath: 'terraform-aws-connector/main.tf',
    uiPage: '/architecture',
    talkingPoint: 'I can explain cross-cloud log ingestion and AssumeRole trust boundaries.',
  },
  {
    skill: 'CI/CD security',
    evidence: 'Gitleaks, TFSec, Trivy, CodeQL, Go tests, UI build, detection validation',
    repoPath: '.github/workflows/sentinel-ci-cd.yaml',
    uiPage: '/operations',
    talkingPoint: 'The pipeline validates code, detections, Terraform, and UI before deployment.',
  },
  {
    skill: 'SOAR',
    evidence: 'Human-approved containment design with least-privilege managed identity',
    repoPath: 'docs/soar/human-approved-containment.md',
    uiPage: '/operations',
    talkingPoint: 'I do not claim autonomous containment; I designed approval and scope checks.',
  },
  {
    skill: 'Detection engineering',
    evidence: 'Rule quality standard, sample telemetry, validation runner, tuning guides',
    repoPath: 'docs/detection-engineering/',
    uiPage: '/detections/0710c724-a738-4b0f-af52-947ba4f01c0d',
    talkingPoint: 'I can defend severity, thresholds, MITRE mapping, entity mapping, and response guidance.',
  },
  {
    skill: 'Identity security',
    evidence: 'Password spray, MFA fatigue, role assignment, service principal credential rules',
    repoPath: 'sentinel-detection-pack/rules-yaml/identity/',
    uiPage: '/detections',
    talkingPoint: 'The identity rules target Entra ID attack paths and include triage context.',
  },
  {
    skill: 'Incident response',
    evidence: 'Scenario walkthrough, incident board demo, investigation graph, SOAR response docs',
    repoPath: 'docs/soar/',
    uiPage: '/detections/0710c724-a738-4b0f-af52-947ba4f01c0d',
    talkingPoint: 'I connect detection output to analyst triage and containment decisions.',
  },
];

const hardQuestions = [
  'Why scheduled rules instead of NRT rules?',
  'How do entity mappings improve Sentinel investigations?',
  'How would you tune password spray detection in a noisy tenant?',
  'How do you avoid false positives from VPN or NAT egress?',
  'How does GitHub OIDC reduce deployment secret risk?',
  'What are the limits of mocked detection validation?',
  'How would you productionize live Sentinel assertion?',
  'How would you control Sentinel ingestion costs?',
  'How would you test this against a real Sentinel workspace?',
  'What would you improve next if given two weeks?',
];

const resumeBullets = [
  'Built a Microsoft Sentinel Detection-as-Code lab with KQL/YAML analytics rules, Go-based validation/deployment tooling, and CI quality gates.',
  'Implemented Terraform modules for Sentinel lab infrastructure, SOAR playbook design, AWS CloudTrail ingestion pattern, and Azure Policy guardrails.',
  'Created a reviewer-focused React/TypeScript UI with a semantic design system that links security claims to repository evidence and clearly labels simulated telemetry.',
  'Added detection quality docs, sample telemetry, metadata validation, and an end-to-end Entra ID password spray walkthrough.',
];

const nonClaims = [
  'Not a production SOC or MDR platform.',
  'Not a replacement for Microsoft Defender XDR or Microsoft Sentinel.',
  'Not fully live telemetry unless a page explicitly says an API is configured.',
  'Not SOC 2, ISO 27001, or NIST certified.',
  'Not autonomous containment.',
  'Not proof that every rule fired in a live tenant.',
];

function routeTemplate(row) {
  return (
    <Link to={row.uiPage} className="font-mono text-xs text-blue-300 hover:text-blue-200">
      {row.uiPage}
    </Link>
  );
}

export default function InterviewMode() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
            <i className="pi pi-comments text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-cyan-100">Candidate Brief</h1>
            <p className="text-gray-400">
              Skills matrix, hard questions, safe resume bullets, and claims this lab does not make.
              For repo-backed proof cards, see{' '}
              <Link to="/evidence" className="text-blue-300 hover:text-blue-200">Evidence</Link>.
            </p>
          </div>
        </div>
      </section>

      <Card title="5-minute reviewer path" className="border border-dark-700 bg-dark-900 shadow-xl">
        <div className="grid gap-3 lg:grid-cols-5">
          {fiveMinutePath.map((item, index) => (
            <Link key={item.step} to={item.route} className="rounded-lg border border-dark-700 bg-dark-950 p-4 transition hover:border-cyan-500/50">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-200">
                  {index + 1}
                </span>
                <Tag value={item.time} severity="info" />
              </div>
              <div className="font-semibold text-gray-100">{item.step}</div>
              <p className="mt-2 text-sm text-gray-400">{item.why}</p>
            </Link>
          ))}
        </div>
      </Card>

      <Card title="Skills matrix" className="border border-dark-700 bg-dark-900 shadow-xl">
        <p className="mb-4 text-sm text-gray-400">
          Each skill links to a UI page and repo path. Detailed proof cards and CI validation are on{' '}
          <Link to="/evidence" className="text-blue-300 hover:text-blue-200">Evidence</Link>.
        </p>
        <DataTable value={skills} paginator rows={10} className="p-datatable-sm" responsiveLayout="scroll">
          <Column field="skill" header="Skill" sortable className="font-semibold text-gray-100" />
          <Column field="evidence" header="Evidence summary" className="text-sm text-gray-300" />
          <Column field="repoPath" header="Repo path" className="font-mono text-xs text-blue-300" />
          <Column header="UI page" body={routeTemplate} />
          <Column field="talkingPoint" header="Interview talking point" className="text-sm text-gray-400" />
        </DataTable>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Hard questions I can answer" className="border border-dark-700 bg-dark-900 shadow-xl">
          <div className="grid gap-2">
            {hardQuestions.map((question) => (
              <div key={question} className="rounded-lg border border-dark-700 bg-dark-950 p-3 text-sm text-gray-300">
                <i className="pi pi-question-circle mr-2 text-cyan-300" />
                {question}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Resume bullets — safe wording" className="border border-dark-700 bg-dark-900 shadow-xl">
          <div className="space-y-3">
            {resumeBullets.map((bullet) => (
              <div key={bullet} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-gray-300">
                <i className="pi pi-check mr-2 text-emerald-300" />
                {bullet}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Claims I do not make" className="border border-red-500/30 bg-red-500/5 shadow-xl">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {nonClaims.map((claim) => (
            <div key={claim} className="rounded-lg border border-red-500/20 bg-dark-950 p-3 text-sm text-red-100">
              <i className="pi pi-times-circle mr-2 text-red-300" />
              {claim}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
