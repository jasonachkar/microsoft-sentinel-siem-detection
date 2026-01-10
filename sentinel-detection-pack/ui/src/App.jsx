import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/threat-map" element={<ThreatMap />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/incidents/:incidentId" element={<Incidents />} />
            <Route path="/rules" element={<RulesCatalog />} />
            <Route path="/rules/:ruleId" element={<RulesCatalog />} />
            <Route path="/mitre" element={<MitreNavigator />} />
            <Route path="/investigation" element={<Investigation />} />
            <Route path="/kql" element={<KQLPlayground />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/simulator" element={<AttackSimulator />} />
            <Route path="/tutorial" element={<Tutorial />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
