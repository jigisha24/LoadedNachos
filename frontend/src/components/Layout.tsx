import React from 'react';
import { LayoutDashboard, UploadCloud, Cpu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'upload' | 'simulation';
  setActiveTab: (tab: 'dashboard' | 'upload' | 'simulation') => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Dataset', icon: UploadCloud },
    { id: 'simulation', label: 'Simulation', icon: Cpu },
  ] as const;

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-charcoal-900 border-r border-charcoal-800 shrink-0">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-neon-teal rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.5)]">
              <span className="text-charcoal-950 font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">FairLens-AI</h1>
              <p className="text-[10px] text-neon-teal uppercase tracking-wider font-semibold">Bias Detection</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-neon-teal/10 text-neon-teal' 
                      : 'text-gray-400 hover:bg-charcoal-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-neon-teal drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-charcoal-800 bg-charcoal-950/80 backdrop-blur-md flex items-center px-8 shrink-0 sticky top-0 z-10">
          <div className="flex items-center text-sm text-gray-400">
            <span>FairLens-AI</span>
            <span className="mx-2">/</span>
            <span className="text-white font-medium capitalize">{activeTab}</span>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="w-2 h-2 bg-neon-green rounded-full shadow-[0_0_8px_rgba(57,255,20,0.8)] animate-pulse"></div>
            <span className="text-sm text-gray-400">System Online</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
