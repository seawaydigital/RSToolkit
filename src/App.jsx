import React, { useState, useEffect, lazy, Suspense } from 'react';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import Home from './components/home/Home';
import { ALL_TOOLS } from './data/toolRegistry';
import GlobalSearchModal from './components/ui/SearchBar';
import './styles/global.css';

const TOOL_COMPONENTS = {
  'strac-flowchart': lazy(() => import('./tools/flowcharts/StracFlowchart')),
  'nsgrp-flowchart': lazy(() => import('./tools/flowcharts/NsgrpFlowchart')),
  'ontario-flowchart': lazy(() => import('./tools/flowcharts/OntarioFlowchart')),
  'stra-lookup': lazy(() => import('./tools/compliance/StraLookup')),
  'nro-lookup': lazy(() => import('./tools/compliance/NroLookup')),
  'risk-checklist': lazy(() => import('./tools/compliance/RiskChecklist')),
  'export-control': lazy(() => import('./tools/reference/ExportControl')),
};

function getHashRoute() {
  const hash = window.location.hash.replace('#', '').replace('/', '');
  return hash || null;
}

function ErrorFallback({ error, onReset }) {
  return (
    <div className="error-fallback">
      <h2>Something went wrong</h2>
      <p>{error?.message || 'An unexpected error occurred.'}</p>
      <button onClick={onReset}>Go Home</button>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={() => {
            this.setState({ error: null });
            this.props.onReset?.();
          }}
        />
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(getHashRoute);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onHashChange() {
      setCurrentRoute(getHashRoute());
      setSidebarOpen(false);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function navigate(slug) {
    window.location.hash = slug;
  }

  function goHome() {
    window.location.hash = '';
    setCurrentRoute(null);
  }

  const currentTool = ALL_TOOLS.find(t => t.slug === currentRoute);
  const ToolComponent = currentRoute ? TOOL_COMPONENTS[currentRoute] : null;

  return (
    <div className="app">
      <Topbar
        onMenuToggle={() => setSidebarOpen(prev => !prev)}
        showMenuButton={isMobile}
        onLogoClick={goHome}
        onSearchOpen={() => setSearchOpen(true)}
      />
      <div className="app-body">
        <Sidebar
          currentToolId={currentTool?.id}
          onNavigate={navigate}
          isOpen={isMobile ? sidebarOpen : true}
          onClose={() => setSidebarOpen(false)}
        />
        <MainContent>
          <ErrorBoundary onReset={goHome} key={currentRoute}>
            {ToolComponent ? (
              <Suspense fallback={<div className="loading">Loading tool...</div>}>
                <ToolComponent onNavigate={navigate} />
              </Suspense>
            ) : (
              <Home onNavigate={navigate} />
            )}
          </ErrorBoundary>
        </MainContent>
      </div>
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={navigate}
      />
    </div>
  );
}
