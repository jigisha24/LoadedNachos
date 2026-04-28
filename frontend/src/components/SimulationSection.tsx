import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Sparkles, ArrowRight, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export function SimulationSection() {
  const [formData, setFormData] = useState({
    income: '',
    creditScore: '',
    debtRatio: '0.3',
    modelScore: '0.4',
    gender: 'female'
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    original: boolean;
    adjusted: boolean;
    explanation: string;
    originalScore: number;
    adjustedScore: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/simulate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          income: parseFloat(formData.income),
          credit_score: parseFloat(formData.creditScore),
          debt_ratio: parseFloat(formData.debtRatio),
          model_score: parseFloat(formData.modelScore),
          gender: formData.gender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Simulation failed');
      }

      setResult({
        original: data.original_score >= 0.6,
        adjusted: data.decision === 1,
        explanation: data.explanation,
        originalScore: data.original_score,
        adjustedScore: data.adjusted_score,
      });

    } catch (err: any) {
      console.error(err);
      setError("We are experiencing an error right now, please try again later.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Live Simulation</h1>
        <p className="text-gray-400">Test the bias detection engine by inputting mock applicant data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-semibold text-white mb-6">Applicant Data</h2>
          
          {error && (
            <div className="mb-6 flex items-center space-x-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-lg text-left">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Annual Income ($)</label>
                <input 
                  type="number"
                  required
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal transition-colors"
                  placeholder="e.g. 65000"
                  value={formData.income}
                  onChange={e => setFormData({...formData, income: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Credit Score</label>
                <input 
                  type="number"
                  required
                  min="300"
                  max="850"
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal transition-colors"
                  placeholder="e.g. 680"
                  value={formData.creditScore}
                  onChange={e => setFormData({...formData, creditScore: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Debt Ratio (0-1)</label>
                <input 
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  max="1"
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal transition-colors"
                  value={formData.debtRatio}
                  onChange={e => setFormData({...formData, debtRatio: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Base Model Score</label>
                <input 
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  max="1"
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal transition-colors"
                  value={formData.modelScore}
                  onChange={e => setFormData({...formData, modelScore: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
              <select 
                className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal transition-colors appearance-none"
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </div>

            <Button type="submit" className="w-full mt-4" isLoading={isSimulating}>
              {isSimulating ? 'Running Simulation...' : 'Run Simulation'}
            </Button>
          </form>
        </Card>

        <div>
          {result ? (
            <Card glow className="h-full border-neon-teal/30 bg-charcoal-800/30 flex flex-col animate-in slide-in-from-right-4 fade-in">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Sparkles className="w-5 h-5 text-neon-teal mr-2" />
                Simulation Results
              </h2>
              
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between p-4 bg-charcoal-900 rounded-lg border border-charcoal-700">
                  <div>
                    <p className="text-sm text-gray-400">Original Decision</p>
                    <p className="font-semibold text-white mt-1">Score: {result.originalScore.toFixed(2)}</p>
                  </div>
                  {result.original ? (
                    <div className="flex items-center text-neon-green bg-neon-green/10 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approved
                    </div>
                  ) : (
                    <div className="flex items-center text-red-400 bg-red-400/10 px-3 py-1 rounded-full">
                      <XCircle className="w-4 h-4 mr-1.5" /> Rejected
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="text-gray-600 rotate-90 lg:rotate-0" />
                </div>

                <div className="flex items-center justify-between p-4 bg-charcoal-900 rounded-lg border border-neon-teal/50 shadow-[0_0_15px_rgba(0,240,255,0.1)] relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-teal"></div>
                  <div className="pl-2">
                    <p className="text-sm text-neon-teal">FairLens Adjusted</p>
                    <p className="font-semibold text-white mt-1">Score: {result.adjustedScore.toFixed(2)}</p>
                  </div>
                  {result.adjusted ? (
                    <div className="flex items-center text-neon-green bg-neon-green/10 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approved
                    </div>
                  ) : (
                    <div className="flex items-center text-red-400 bg-red-400/10 px-3 py-1 rounded-full">
                      <XCircle className="w-4 h-4 mr-1.5" /> Rejected
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">AI Explanation</h3>
                  <p className="text-gray-300 leading-relaxed text-sm bg-charcoal-950 p-4 rounded-lg border border-charcoal-800">
                    {result.explanation}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full border-2 border-dashed border-charcoal-800 rounded-xl flex items-center justify-center p-8 text-center text-gray-500">
              Fill out the form and run the simulation to see how FairLens adjusts loan decisions in real-time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
