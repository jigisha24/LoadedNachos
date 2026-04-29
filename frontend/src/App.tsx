import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { UploadSection } from './components/UploadSection';
import { SimulationSection } from './components/SimulationSection';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'simulation'>('dashboard');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'upload' && <UploadSection />}
      {activeTab === 'simulation' && <SimulationSection />}
    </Layout>
  );
}

export default App;
