import React, { useMemo, useState } from 'react';
import { Card } from 'primereact/card';
import { Slider } from 'primereact/slider';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function FinOpsDashboard() {
  const [ingestionRate, setIngestionRate] = useState(500);

  const model = useMemo(() => {
    const sentinelCostPerGB = 3.5;
    const coldStorageCostPerGB = 0.2;
    const hotData = ingestionRate * 0.3;
    const coldData = ingestionRate * 0.7;
    const traditionalCost = ingestionRate * sentinelCostPerGB * 30;
    const optimizedCost = ((hotData * sentinelCostPerGB) + (coldData * coldStorageCostPerGB)) * 30;
    const savings = traditionalCost - optimizedCost;
    const savingsRate = Math.round((savings / traditionalCost) * 100);

    return {
      hotData,
      coldData,
      traditionalCost,
      optimizedCost,
      savings,
      savingsRate,
    };
  }, [ingestionRate]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
            <i className="pi pi-dollar text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security FinOps & Data Routing</h1>
            <p className="text-gray-400">
              SIEM decoupling architecture for routing high-value telemetry to Sentinel and low-value volume to cold storage.
            </p>
          </div>
        </div>
      </section>

      <Card className="border border-dark-700 bg-dark-900 shadow-xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_220px] lg:items-center">
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-100">Daily Ingestion Simulator</h2>
                <p className="text-sm text-gray-400">Model GB/day and monthly cost impact across hot and cold tiers.</p>
              </div>
              <Tag value={`${ingestionRate.toLocaleString()} GB/day`} severity="info" className="text-base" />
            </div>
            <Slider
              value={ingestionRate}
              onChange={(event) => setIngestionRate(event.value)}
              min={50}
              max={5000}
              step={25}
              className="mt-6"
            />
            <div className="mt-3 flex justify-between text-xs text-gray-500">
              <span>50 GB</span>
              <span>5,000 GB</span>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
            <div className="text-sm uppercase tracking-wide text-emerald-200">Savings Rate</div>
            <div className="mt-2 text-5xl font-black text-emerald-300">{model.savingsRate}%</div>
            <ProgressBar value={model.savingsRate} showValue={false} className="mt-4 h-2" />
          </div>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-3">
        <Card title="Traditional SIEM Cost" className="border-t-4 border-red-500 bg-dark-900 shadow-lg">
          <div className="text-4xl font-bold text-red-300">{currency.format(model.traditionalCost)}</div>
          <p className="mt-2 text-sm text-gray-400">100% of volume sent to Microsoft Sentinel hot tier.</p>
        </Card>

        <Card title="Optimized Routing" className="border-t-4 border-blue-500 bg-dark-900 shadow-lg">
          <div className="text-4xl font-bold text-blue-300">{currency.format(model.optimizedCost)}</div>
          <p className="mt-2 text-sm text-gray-400">30% high-fidelity telemetry to SIEM, 70% to Data Lake.</p>
        </Card>

        <Card title="Monthly Savings" className="border-t-4 border-emerald-500 bg-dark-900 shadow-lg">
          <div className="text-4xl font-bold text-emerald-300">{currency.format(model.savings)}</div>
          <p className="mt-2 text-sm text-gray-400">Direct security budget impact from lower ingestion spend.</p>
        </Card>
      </div>

      <Card className="border border-dark-700 bg-dark-900 shadow-xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Data Routing Architecture</h2>
            <p className="text-sm text-gray-400">Business-aware telemetry routing for multi-cloud SOC operations.</p>
          </div>
          <Tag value="FinOps Ready" severity="success" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1.2fr] lg:items-center">
          <div className="rounded-lg border border-dark-700 bg-dark-950 p-5 text-center">
            <i className="pi pi-server mb-3 block text-3xl text-blue-300" />
            <div className="font-semibold">Raw Data Sources</div>
            <div className="mt-1 text-xs text-gray-500">AWS, Azure, Kubernetes, endpoints</div>
          </div>

          <i className="pi pi-arrow-right hidden text-2xl text-gray-600 lg:block" />

          <div className="relative rounded-lg border border-yellow-500/30 bg-dark-950 p-5 text-center">
            <span className="absolute right-0 top-0 rounded-bl-md rounded-tr-md bg-yellow-500 px-2 py-1 text-xs font-semibold text-black">
              Logstash / Cribl
            </span>
            <i className="pi pi-database mb-3 block text-3xl text-yellow-300" />
            <div className="font-semibold">Data Pipeline Router</div>
            <div className="mt-1 text-xs text-gray-500">Filter, normalize, enrich</div>
          </div>

          <i className="pi pi-arrow-right hidden text-2xl text-gray-600 lg:block" />

          <div className="grid gap-4">
            <div className="rounded-lg border border-red-500/30 bg-dark-950 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-300">Microsoft Sentinel</span>
                <Tag value={`${Math.round(model.hotData).toLocaleString()} GB/day`} severity="danger" />
              </div>
              <p className="mt-1 text-xs text-gray-400">High-fidelity security alerts and active incidents.</p>
            </div>
            <div className="rounded-lg border border-blue-500/30 bg-dark-950 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-300">Azure Data Explorer</span>
                <Tag value={`${Math.round(model.coldData).toLocaleString()} GB/day`} severity="info" />
              </div>
              <p className="mt-1 text-xs text-gray-400">Compliance retention, low-cost search, and threat hunting.</p>
            </div>
          </div>
        </div>

        <Divider />
        <div className="grid gap-3 text-sm text-gray-300 md:grid-cols-3">
          <div><strong className="text-gray-100">Hot tier:</strong> Sentinel analytics, alerting, and SOAR triggers.</div>
          <div><strong className="text-gray-100">Cold tier:</strong> low-signal noise, firewall drops, and compliance archives.</div>
          <div><strong className="text-gray-100">Outcome:</strong> detection coverage stays high while ingestion spend drops.</div>
        </div>
      </Card>
    </div>
  );
}
