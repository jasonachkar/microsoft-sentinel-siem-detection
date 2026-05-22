import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';

const postureItems = [
  {
    title: 'Azure Sentinel Core',
    path: '/terraform/main.tf',
    icon: 'pi pi-cloud',
    color: 'text-blue-300',
    status: 'Provisioned',
    severity: 'success',
  },
  {
    title: 'AWS CloudTrail Connector',
    path: '/terraform-aws-connector/main.tf',
    icon: 'pi pi-amazon',
    color: 'text-orange-300',
    status: 'Active (OIDC)',
    severity: 'success',
  },
  {
    title: 'SOAR Logic Apps',
    path: '/terraform-soar/main.tf',
    icon: 'pi pi-bolt',
    color: 'text-purple-300',
    status: 'Listening',
    severity: 'success',
  },
];

export default function InfrastructurePosture() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
            <i className="pi pi-sitemap text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-indigo-200">Infrastructure & Cloud-Native Posture</h1>
            <p className="text-gray-400">Live state of Terraform modules, multi-cloud integrations, and Kubernetes telemetry.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="IaC Deployment State" className="border border-dark-700 bg-dark-900 shadow-lg">
          <div className="space-y-4">
            {postureItems.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-lg border border-dark-700 bg-dark-950 p-4">
                <div>
                  <div className={`font-bold ${item.color}`}>
                    <i className={`${item.icon} mr-2`} />
                    {item.title}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">{item.path}</div>
                </div>
                <Tag severity={item.severity} value={item.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Cloud-Native Security" className="border border-dark-700 bg-dark-900 shadow-lg">
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <i className="pi pi-box mb-4 text-6xl text-blue-400" />
            <h3 className="text-xl font-bold text-gray-100">AKS / EKS Telemetry</h3>
            <p className="mt-2 text-gray-400">
              Container execution anomalies and API audit logs route through Azure Monitor into Sentinel hot storage.
            </p>
            <Divider />
            <div className="w-full text-left">
              <div className="mb-2 text-sm text-gray-400">Active Kubernetes Detection</div>
              <div className="rounded border border-emerald-500/30 bg-dark-950 p-3 font-mono text-sm text-emerald-300">
                <i className="pi pi-check-circle mr-2" />
                Kubernetes_Suspicious_Exec.yaml
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
