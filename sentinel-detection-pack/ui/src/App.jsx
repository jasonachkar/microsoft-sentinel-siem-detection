import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import CommandCenter from './components/CommandCenter';
import Dashboard from './components/Dashboard';
import ThreatMap from './components/ThreatMap';
import Incidents from './components/Incidents';
import RulesCatalog from './components/RulesCatalog';
import MitreNavigator from './components/MitreNavigator';
import Investigation from './components/Investigation';
import KQLPlayground from './components/KQLPlayground';
import Metrics from './components/Metrics';
import AttackSimulator from './components/AttackSimulator';
import Tutorial from './components/Tutorial';
import SoarDashboard from './components/SoarDashboard';
import AICopilot from './components/AICopilot';
import FinOpsDashboard from './components/FinOpsDashboard';
import InfrastructurePosture from './components/InfrastructurePosture';
import LivePostureDashboard from './components/LivePostureDashboard';
import KubernetesDashboard from './components/KubernetesDashboard';
import LiveIncidentsDashboard from './components/LiveIncidentsDashboard';
import AppSecDashboard from './components/AppSecDashboard';
import TerraformDrift from './components/TerraformDrift';
import IaCExplorer from './components/IaCExplorer';
import ArchitectureMap from './components/ArchitectureMap';
import DetectionDeepDive from './components/DetectionDeepDive';
import ComplianceCenter from './components/ComplianceCenter';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/threat-map" element={<ThreatMap />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/incidents/:incidentId" element={<Incidents />} />
            <Route path="/live-incidents" element={<LiveIncidentsDashboard />} />
            <Route path="/rules" element={<RulesCatalog />} />
            <Route path="/rules/:ruleId" element={<RulesCatalog />} />
            <Route path="/mitre" element={<MitreNavigator />} />
            <Route path="/investigation" element={<Investigation />} />
            <Route path="/kql" element={<KQLPlayground />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/simulator" element={<AttackSimulator />} />
            <Route path="/soar" element={<SoarDashboard />} />
            <Route path="/copilot" element={<AICopilot />} />
            <Route path="/ai-copilot" element={<AICopilot />} />
            <Route path="/finops" element={<FinOpsDashboard />} />
            <Route path="/appsec" element={<AppSecDashboard />} />
            <Route path="/drift" element={<TerraformDrift />} />
            <Route path="/iac" element={<IaCExplorer />} />
            <Route path="/architecture" element={<ArchitectureMap />} />
            <Route path="/detection-engineering" element={<DetectionDeepDive />} />
            <Route path="/compliance" element={<ComplianceCenter />} />
            <Route path="/infrastructure" element={<InfrastructurePosture />} />
            <Route path="/posture" element={<LivePostureDashboard />} />
            <Route path="/live-posture" element={<LivePostureDashboard />} />
            <Route path="/kubernetes" element={<KubernetesDashboard />} />
            <Route path="/tutorial" element={<Tutorial />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
