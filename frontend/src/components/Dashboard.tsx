import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { Activity, ShieldAlert, Users, Loader2 } from 'lucide-react';
import { getAnalysis } from '../services/api';

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnalysis()
      .then(json => {
        console.log('Analysis response:', json);
        if (json.error) {
          throw new Error(json.error);
        }
        setData(json);
        setError(null);
      })
      .catch(err => {
        console.error('Analysis error:', err);
        setError(err.message || 'Failed to fetch analysis');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-neon-teal animate-spin mb-4" />
        <p className="text-gray-400">Loading analysis data...</p>
      </div>
    );
  }

  if (error) {
    const isUploadError = error === "Upload dataset first" || error.includes("Upload dataset first");
    const displayMessage = isUploadError 
      ? "No dataset loaded. Please upload a dataset to begin analysis." 
      : "We are experiencing an error right now, please try again later.";
      
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 text-center px-4">
        <ShieldAlert className="w-12 h-12 text-charcoal-700" />
        <p className="text-gray-400 text-lg">{displayMessage}</p>
        {isUploadError && (
          <p className="text-sm text-gray-500">Go to "Upload Dataset" to load your CSV first.</p>
        )}
      </div>
    );
  }

  // Map backend data to UI metrics
  const globalBias = data.global_bias || {};
  const clusterBias = data.cluster_bias || [];

  const isFair = !globalBias.bias_detected;
  const fairnessPercentage = ((globalBias.disparate_impact || 0) * 100).toFixed(1);
  const groupsAnalyzed = globalBias.acceptance_rates ? Object.keys(globalBias.acceptance_rates).length : 0;

  const globalChartData = globalBias.acceptance_rates ? Object.keys(globalBias.acceptance_rates).map(group => ({
    name: group.charAt(0).toUpperCase() + group.slice(1),
    rate: Number((globalBias.acceptance_rates[group] * 100).toFixed(1))
  })) : [];

  // Find top 2 demographic groups dynamically
  const groups = globalBias.acceptance_rates ? Object.keys(globalBias.acceptance_rates) : [];
  const group1 = groups[0] || 'Group 1';
  const group2 = groups[1];

  const clusterChartData = clusterBias.map((c: any) => ({
    name: `Cluster ${c.cluster_id}`,
    [group1]: Number(((c.acceptance_rates?.[group1] || 0) * 100).toFixed(1)),
    ...(group2 ? { [group2]: Number(((c.acceptance_rates?.[group2] || 0) * 100).toFixed(1)) } : {})
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-gray-400">Monitor bias metrics and fairness scores across loan decisions.</p>
      </div>

      {data.llm_analysis && (
        <Card glow className="mb-6 border-neon-teal/30 bg-[#0a0a0a]">
          <h2 className="text-2xl font-bold text-white mb-2">
            AI Fairness Analysis
          </h2>
          <p className="text-gray-300 whitespace-pre-wrap">{data.llm_analysis}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glow className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert size={64} className={isFair ? "text-neon-green" : "text-red-400"} />
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <div className={`p-3 rounded-lg ${isFair ? 'bg-neon-green/10' : 'bg-red-400/10'}`}>
              <ShieldAlert className={`w-6 h-6 ${isFair ? 'text-neon-green' : 'text-red-400'}`} />
            </div>
            <h3 className="text-gray-400 font-medium">Bias Status</h3>
          </div>
          <p className="text-2xl font-bold text-white">{isFair ? 'Not Detected' : 'Detected'}</p>
          <div className={`mt-2 text-sm flex items-center font-bold ${isFair ? 'text-neon-green' : 'text-red-400'}`}>
             Bias Score: {globalBias.bias_score}
          </div>
        </Card>

        <Card glow className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={64} className="text-neon-teal" />
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-neon-teal/10 rounded-lg">
              <Activity className="w-6 h-6 text-neon-teal" />
            </div>
            <h3 className="text-gray-400 font-medium">Fairness Ratio</h3>
          </div>
          <p className="text-2xl font-bold text-white">{fairnessPercentage}%</p>
          <div className="mt-2 text-sm text-neon-teal flex items-center">
            (Disparate Impact)
          </div>
        </Card>

        <Card glow className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={64} className="text-white" />
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-gray-400 font-medium">Groups Analyzed</h3>
          </div>
          <p className="text-2xl font-bold text-white">{groupsAnalyzed}</p>
          <div className="mt-2 text-sm text-gray-500 flex items-center">
            Demographic segments
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="text-xl font-bold text-white mb-6">Acceptance Rates by Demographic</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={globalChartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
              <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} />
              <YAxis stroke="#888" tick={{ fill: '#888' }} domain={[0, 100]} />
              <Tooltip 
                cursor={{ fill: '#1e1e1e' }}
                contentStyle={{ backgroundColor: '#121212', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                formatter={(value: number) => [`${value}%`, 'Acceptance Rate']}
              />
              <Legend />
              <Bar dataKey="rate" name="Acceptance Rate (%)" fill="#00f0ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {clusterBias.length > 0 && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Cluster Bias</h2>
            <p className="text-gray-400 mb-6">Analyzing bias localized to specific credit amount and duration clusters.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {clusterBias.map((c: any) => (
              <Card key={c.cluster_id} glow className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Users size={64} className={c.bias_detected ? "text-red-400" : "text-neon-green"} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Cluster {c.cluster_id}</h3>
                {c.features && Object.keys(c.features).length > 0 && (
                  <div className="mb-4 text-xs text-gray-400 space-y-1 bg-black/20 p-2 rounded relative z-10 border border-gray-800">
                    {Object.entries(c.features).map(([key, val]: any) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span>{val.min} - {val.max}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2 mb-4 relative z-10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 capitalize">{group1} Acceptance:</span>
                    <span className="text-white">{((c.acceptance_rates?.[group1] || 0) * 100).toFixed(1)}%</span>
                  </div>
                  {group2 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 capitalize">{group2} Acceptance:</span>
                      <span className="text-white">{((c.acceptance_rates?.[group2] || 0) * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                <div className={`mt-2 text-sm font-bold flex items-center justify-between relative z-10 ${c.bias_detected ? 'text-red-400' : 'text-neon-green'}`}>
                  <span>{c.bias_detected ? 'Bias Detected: YES' : 'Bias Detected: NO'}</span>
                  <span className="text-xs opacity-80">Score: {c.bias_score}</span>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <h3 className="text-xl font-bold text-white mb-6">Cluster Acceptance Comparison</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={clusterChartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} />
                  <YAxis stroke="#888" tick={{ fill: '#888' }} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{ fill: '#1e1e1e' }}
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value}%`, 'Acceptance Rate']}
                  />
                  <Legend />
                  <Bar dataKey={group1} fill="#00f0ff" radius={[4, 4, 0, 0]} />
                  {group2 && <Bar dataKey={group2} fill="#a400ff" radius={[4, 4, 0, 0]} />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
