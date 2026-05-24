import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';

const reviewerPath = [
  {
    step: 'Start with Reviewer Mode',
    route: '/',
    why: 'Positions the project honestly and shows the proof pillars.',
    time: '60 sec',
  },
  {
    step: 'Open the flagship scenario',
    route: '/scenario/password-spray',
    why: 'Shows KQL, metadata, entity mapping, triage, response, and sample telemetry.',
    time: '90 sec',
  },
  {
    step: 'Check Evidence Center',
    route: '/evidence',
    why: 'Answers what was actually built and where the proof lives.',
    time: '60 sec',
  },
  {
    step: 'Review CI/CD and drift',
    route: '/drift',
    why: 'Shows validation, security gates, Terraform plan, and issue-based incidentization.',
    time: '45 sec',
  },
  {
    step: 'Read limitations',
    route: '/evidence',
    why: 'Separates demo telemetry from live evidence and planned work.',
    time: '45 sec',
  },
];

const skills = [
  {
    skill: 'Microsoft Sentinel',
    evidence: 'Scheduled analytics rules, incident workflow, Defender portal alignment',
    repoPath: 'sentinel-detection-pack/rules-yaml/',
    uiPage: '/rules',
    talkingPoint: 'I can explain rule metadata, incidents, automation, and Defender portal workflow.',
  },
  {
    skill: 'KQL',
    evidence: 'Password spray, Key Vault, AKS, CloudTrail, M365, and identity detections',
    repoPath: 'sentinel-detection-pack/rules/',
    uiPage: '/detection-engineering',
    talkingPoint: 'I tune detections with thresholds, allowlists, schema assumptions, and false-positive notes.',
  },
  {
    skill: 'Terraform',
    evidence: 'Sentinel core, honeypot, SOAR, AWS connector, Azure Policy modules',
    repoPath: 'terraform*/',
    uiPage: '/iac',
    talkingPoint: 'I use IaC so cloud security controls can be reviewed, scanned, and reproduced.',
  },
  {
    skill: 'Azure security',
    evidence: 'Log Analytics, Sentinel, Azure Policy, diagnostic logging design, OIDC',
    repoPath: 'docs/cloud-security-controls.md',
    uiPage: '/cloud-security-controls',
    talkingPoint: 'I connect prevention, logging, detection, response, identity, and cost.',
  },
  {
    skill: 'AWS security logging',
    evidence: 'CloudTrail connector, S3 hardening, KMS, external ID trust model',
    repoPath: 'terraform-aws-connector/main.tf',
    uiPage: '/cloud-security-controls',
    talkingPoint: 'I can explain cross-cloud log ingestion and AssumeRole trust boundaries.',
  },
  {
    skill: 'CI/CD security',
    evidence: 'Gitleaks, TFSec, Trivy, CodeQL, Go tests, UI build, detection validation',
    repoPath: '.github/workflows/sentinel-ci-cd.yaml',
    uiPage: '/appsec',
    talkingPoint: 'The pipeline validates code, detections, Terraform, and UI before deployment.',
  },
  {
    skill: 'SOAR',
    evidence: 'Human-approved containment design with least-privilege managed identity',
    repoPath: 'docs/soar/human-approved-containment.md',
    uiPage: '/soar',
    talkingPoint: 'I do not claim autonomous containment; I designed approval and scope checks.',
  },
  {
    skill: 'Detection engineering',
    evidence: 'Rule quality standard, sample telemetry, validation runner, tuning guides',
    repoPath: 'docs/detection-engineering/',
    uiPage: '/scenario/password-spray',
    talkingPoint: 'I can defend severity, thresholds, MITRE mapping, entity mapping, and response guidance.',
  },
  {
    skill: 'Identity security',
    evidence: 'Password spray, MFA fatigue, role assignment, service principal credential rules',
    repoPath: 'sentinel-detection-pack/rules-yaml/identity/',
    uiPage: '/rules',
    talkingPoint: 'The identity rules target Entra ID attack paths and include triage context.',
  },
  {
    skill: 'Incident response',
    evidence: 'Scenario walkthrough, incident board demo, investigation graph, SOAR response docs',
    repoPath: 'docs/soar/',
    uiPage: '/scenario/password-spray',
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
  'Created a reviewer-focused React/PrimeReact UI that links security claims to repository evidence and clearly labels simulated telemetry.',
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

function statusTemplate() {
  return <Tag value="Evidence" severity="success" />;
}

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
            <h1 className="text-3xl font-bold tracking-tight text-cyan-100">Interview Mode</h1>
            <p className="text-gray-400">
              Fast reviewer path, skills matrix, hard questions, safe resume bullets, and claims this lab does not make.
            </p>
          </div>
        </div>
      </section>

      <Card title="5-Minute Reviewer Path" className="border border-dark-700 bg-dark-900 shadow-xl">
        <div className="grid gap-3 lg:grid-cols-5">
          {reviewerPath.map((item, index) => (
            <Link key={item.step} to={item.route} className="rounded-lg border border-dark-700 bg-dark-950 p-4 transition hover:border-cyan-500/50">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-200">
                  {index + 1}
                </span>
                <Tag value={item.time} severity="info" />
              </div>
              <div className="font-semibold text-gray-100">{item.step}</div>
              <p className="mt-2 text-sm text-gray-400">{item.why}</p>
              <div className="mt-3 font-mono text-xs text-blue-300">{item.route}</div>
            </Link>
          ))}
        </div>
      </Card>

      <Card title="Skills Matrix" className="border border-dark-700 bg-dark-900 shadow-xl">
        <DataTable value={skills} paginator rows={10} className="p-datatable-sm" responsiveLayout="scroll">
          <Column header="Status" body={statusTemplate} style={{ width: '8rem' }} />
          <Column field="skill" header="Skill" sortable className="font-semibold text-gray-100" />
          <Column field="evidence" header="Evidence" className="text-sm text-gray-300" />
          <Column field="repoPath" header="Repo path" className="font-mono text-xs text-blue-300" />
          <Column header="UI page" body={routeTemplate} />
          <Column field="talkingPoint" header="Interview talking point" className="text-sm text-gray-400" />
        </DataTable>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Hard Questions I Can Answer" className="border border-dark-700 bg-dark-900 shadow-xl">
          <div className="grid gap-2">
            {hardQuestions.map((question) => (
              <div key={question} className="rounded-lg border border-dark-700 bg-dark-950 p-3 text-sm text-gray-300">
                <i className="pi pi-question-circle mr-2 text-cyan-300" />
                {question}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Resume Bullets - Safe Wording" className="border border-dark-700 bg-dark-900 shadow-xl">
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

      <Card title="Claims I Do Not Make" className="border border-red-500/30 bg-red-500/5 shadow-xl">
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
