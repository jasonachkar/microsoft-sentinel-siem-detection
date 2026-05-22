import React, { useMemo, useState } from 'react';
import 'chart.js/auto';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Slider } from 'primereact/slider';
import { Tag } from 'primereact/tag';

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function FinOpsDashboard() {
  const [ingestionRate, setIngestionRate] = useState(500);

  const model = useMemo(() => {
    const hotCost = ingestionRate * 0.3 * 3.5 * 30;
    const coldCost = ingestionRate * 0.7 * 0.2 * 30;
    const optimizedCost = hotCost + coldCost;
    const traditionalCost = ingestionRate * 3.5 * 30;
    const savings = traditionalCost - optimizedCost;
    const savingsRate = Math.round((savings / traditionalCost) * 100);

    return {
      hotCost,
      coldCost,
      optimizedCost,
      traditionalCost,
      savings,
      savingsRate,
      hotGb: ingestionRate * 0.3,
      coldGb: ingestionRate * 0.7,
    };
  }, [ingestionRate]);

  const chartData = {
    labels: ['Sentinel Hot Tier (30%)', 'Data Lake Cold Tier (70%)'],
    datasets: [
      {
        data: [model.hotCost, model.coldCost],
        backgroundColor: ['#ef4444', '#3b82f6'],
        hoverBackgroundColor: ['#dc2626', '#2563eb'],
        borderColor: '#0f172a',
        borderWidth: 4,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e5e7eb',
          usePointStyle: true,
          padding: 18,
        },
      },
    },
    cutout: '60%',
    maintainAspectRatio: false,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="border-b border-dark-700 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
            <i className="pi pi-dollar text-xl" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-200">Security FinOps Dashboard</h1>
            <p className="text-gray-400">Interactive SIEM data decoupling and cost optimization routing.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border border-dark-700 bg-dark-900 shadow-xl lg:col-span-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Daily Log Volume</h2>
              <p className="text-sm text-gray-400">Model how much telemetry moves to Sentinel versus cold storage.</p>
            </div>
            <Tag value={`${ingestionRate.toLocaleString()} GB/day`} severity="success" className="text-base" />
          </div>

          <div className="flex items-center gap-6">
            <Slider
              value={ingestionRate}
              onChange={(event) => setIngestionRate(event.value)}
              min={100}
              max={5000}
              step={25}
              className="w-full"
            />
            <span className="w-32 text-right font-mono text-2xl text-emerald-300">{ingestionRate} GB</span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-red-500/30 bg-dark-950 p-4">
              <div className="text-sm text-gray-400">Traditional Bill</div>
              <div className="mt-1 text-3xl font-black text-red-300">{currency.format(model.traditionalCost)}</div>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-dark-950 p-4">
              <div className="text-sm text-gray-400">Optimized Bill</div>
              <div className="mt-1 text-3xl font-black text-emerald-300">{currency.format(model.optimizedCost)}</div>
            </div>
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <div className="text-sm text-green-100">Monthly Savings</div>
              <div className="mt-1 text-3xl font-black text-green-300">{currency.format(model.savings)}</div>
            </div>
          </div>
        </Card>

        <Card title="Spend Distribution" className="border border-dark-700 bg-dark-900 shadow-xl">
          <div className="h-[260px]">
            <Chart type="doughnut" data={chartData} options={chartOptions} className="h-full w-full" />
          </div>
        </Card>
      </div>

      <Card className="border border-dark-700 bg-dark-900 shadow-xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Data Routing Architecture</h2>
            <p className="text-sm text-gray-400">Business-aware telemetry routing for multi-cloud SOC operations.</p>
          </div>
          <Tag value={`${model.savingsRate}% optimized`} severity="success" />
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
                <Tag value={`${Math.round(model.hotGb).toLocaleString()} GB/day`} severity="danger" />
              </div>
              <p className="mt-1 text-xs text-gray-400">High-fidelity alerts, incidents, and SOAR triggers.</p>
            </div>
            <div className="rounded-lg border border-blue-500/30 bg-dark-950 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-300">Azure Data Explorer</span>
                <Tag value={`${Math.round(model.coldGb).toLocaleString()} GB/day`} severity="info" />
              </div>
              <p className="mt-1 text-xs text-gray-400">Compliance retention, low-cost search, and threat hunting.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
