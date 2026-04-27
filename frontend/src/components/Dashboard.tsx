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

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/analyze/')
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error || 'Failed to analyze') });
        }
        return res.json();
      })
      .then(json => {
        setData(json);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
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
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <ShieldAlert className="w-12 h-12 text-charcoal-700" />
        <p className="text-gray-400 text-lg">{error}</p>
        <p className="text-sm text-gray-500">Go to "Upload Dataset" to load your CSV first.</p>
      </div>
    );
  }

  // Map backend data to UI metrics
  const totalApps = data.clusters.reduce((sum: number, c: any) => sum + c.size, 0);
  
  // Disparate impact ratio closer to 1 is fair. Convert to a percentage.
  const fairnessScore = data.bias_metrics.disparate_impact_ratio;
  const isFair = fairnessScore >= 0.8 && fairnessScore <= 1.25;
  const fairnessPercentage = (fairnessScore * 100).toFixed(1);

  const chartData = data.clusters.map((c: any) => ({
    name: `Cluster ${c.cluster_id + 1}`,
    avgIncome: c.avg_income,
    avgCredit: c.avg_credit_score,
    size: c.size
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-gray-400">Monitor bias metrics and fairness scores across loan decisions.</p>
      </div>

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
          <div className={`mt-2 text-sm flex items-center ${isFair ? 'text-neon-green' : 'text-red-400'}`}>
             DP Diff: {data.bias_metrics.demographic_parity_difference}
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
            <h3 className="text-gray-400 font-medium">Total Applications</h3>
          </div>
          <p className="text-2xl font-bold text-white">{totalApps}</p>
          <div className="mt-2 text-sm text-gray-500 flex items-center">
            Analyzed in clusters
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="text-xl font-bold text-white mb-6">Cluster Averages (Credit Score)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
              <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} />
              <YAxis stroke="#888" tick={{ fill: '#888' }} />
              <Tooltip 
                cursor={{ fill: '#1e1e1e' }}
                contentStyle={{ backgroundColor: '#121212', border: '1px solid #2a2a2a', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="avgCredit" name="Average Credit Score" fill="#00f0ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
