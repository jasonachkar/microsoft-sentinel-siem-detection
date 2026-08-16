import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import Home from './pages/Home';
import Detections from './pages/Detections';
import Operations from './pages/Operations';
import Evidence from './pages/Evidence';

// Lazy: these pull in ReactFlow and Monaco+Kusto respectively, both heavy.
// Keeping them out of the main bundle matters for the 30-90s first
// impression the homepage is designed around.
const Architecture = lazy(() => import('./pages/Architecture'));
const ArchitectureDecisions = lazy(() => import('./pages/ArchitectureDecisions'));
const DetectionDetail = lazy(() => import('./pages/DetectionDetail'));

const CandidateBrief = lazy(() => import('./pages/CandidateBrief'));
const LabIndex = lazy(() => import('./pages/LabIndex'));
const LabLayout = lazy(() => import('./lab/LabLayout'));

const LabDashboard = lazy(() => import('./components/Dashboard'));
const LabCommandCenter = lazy(() => import('./components/CommandCenter'));
const LabThreatMap = lazy(() => import('./components/ThreatMap'));
const LabIncidents = lazy(() => import('./components/Incidents'));
const LabLiveIncidents = lazy(() => import('./components/LiveIncidentsDashboard'));
const LabInvestigation = lazy(() => import('./components/Investigation'));
const LabKql = lazy(() => import('./components/KQLPlayground'));
const LabMetrics = lazy(() => import('./components/Metrics'));
const LabSimulator = lazy(() => import('./components/AttackSimulator'));
const LabCopilot = lazy(() => import('./components/AICopilot'));
const LabKubernetes = lazy(() => import('./components/KubernetesDashboard'));
const LabMitre = lazy(() => import('./components/MitreNavigator'));
const LabTutorial = lazy(() => import('./components/Tutorial'));
const LabPosture = lazy(() => import('./components/LivePostureDashboard'));
const LabInfrastructure = lazy(() => import('./components/InfrastructurePosture'));
const LabFinOps = lazy(() => import('./components/FinOpsDashboard'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function LabRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <LabLayout>{children}</LabLayout>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Primary reviewer path */}
          <Route
            path="/*"
            element={
              <AppShell>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/architecture"
                    element={<Suspense fallback={null}><Architecture /></Suspense>}
                  />
                  <Route
                    path="/architecture/decisions"
                    element={<Suspense fallback={null}><ArchitectureDecisions /></Suspense>}
                  />
                  <Route path="/detections" element={<Detections />} />
                  <Route
                    path="/detections/:ruleId"
                    element={<Suspense fallback={null}><DetectionDetail /></Suspense>}
                  />
                  <Route path="/operations" element={<Operations />} />
                  <Route path="/evidence" element={<Evidence />} />
                  <Route
                    path="/interview"
                    element={
                      <Suspense fallback={null}>
                        <CandidateBrief />
                      </Suspense>
                    }
                  />

                  {/* Lab sandbox: experimental/demo pages, isolated CSS, not in primary nav */}
                  <Route
                    path="/lab"
                    element={
                      <Suspense fallback={null}>
                        <LabIndex />
                      </Suspense>
                    }
                  />
                  <Route path="/lab/dashboard" element={<LabRoute><LabDashboard /></LabRoute>} />
                  <Route path="/lab/command-center" element={<LabRoute><LabCommandCenter /></LabRoute>} />
                  <Route path="/lab/threat-map" element={<LabRoute><LabThreatMap /></LabRoute>} />
                  <Route path="/lab/incidents" element={<LabRoute><LabIncidents /></LabRoute>} />
                  <Route path="/lab/incidents/:incidentId" element={<LabRoute><LabIncidents /></LabRoute>} />
                  <Route path="/lab/live-incidents" element={<LabRoute><LabLiveIncidents /></LabRoute>} />
                  <Route path="/lab/investigation" element={<LabRoute><LabInvestigation /></LabRoute>} />
                  <Route path="/lab/kql" element={<LabRoute><LabKql /></LabRoute>} />
                  <Route path="/lab/metrics" element={<LabRoute><LabMetrics /></LabRoute>} />
                  <Route path="/lab/simulator" element={<LabRoute><LabSimulator /></LabRoute>} />
                  <Route path="/lab/copilot" element={<LabRoute><LabCopilot /></LabRoute>} />
                  <Route path="/lab/kubernetes" element={<LabRoute><LabKubernetes /></LabRoute>} />
                  <Route path="/lab/mitre" element={<LabRoute><LabMitre /></LabRoute>} />
                  <Route path="/lab/tutorial" element={<LabRoute><LabTutorial /></LabRoute>} />
                  <Route path="/lab/posture" element={<LabRoute><LabPosture /></LabRoute>} />
                  <Route path="/lab/live-posture" element={<LabRoute><LabPosture /></LabRoute>} />
                  <Route path="/lab/infrastructure" element={<LabRoute><LabInfrastructure /></LabRoute>} />
                  <Route path="/lab/finops" element={<LabRoute><LabFinOps /></LabRoute>} />
                </Routes>
              </AppShell>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
