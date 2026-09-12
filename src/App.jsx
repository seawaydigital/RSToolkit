import React, { useState, useEffect, lazy, Suspense } from 'react';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import Home from './components/home/Home';
import { ALL_TOOLS } from './data/toolRegistry';
import GlobalSearchModal from './components/ui/SearchBar';
import { useAssessment } from './state/useAssessment';
import { releaseStatus } from './data/releaseStatus';
import './styles/global.css';
import './styles/safety.css';

const TOOL_COMPONENTS = {
  'tri-agency-guide': lazy(() => import('./tools/policy-guides/TriAgencyGuide')),
  'strac-flowchart': lazy(() => import('./tools/flowcharts/StracFlowchart')),
  'nsgrp-flowchart': lazy(() => import('./tools/flowcharts/NsgrpFlowchart')),
  'ontario-flowchart': lazy(() => import('./tools/flowcharts/OntarioFlowchart')),
  'stra-lookup': lazy(() => import('./tools/compliance/StraLookup')),
  'nro-lookup': lazy(() => import('./tools/compliance/NroLookup')),
  'risk-checklist': lazy(() => import('./tools/compliance/RiskChecklist')),
  'risk-mitigation': lazy(() => import('./tools/compliance/RiskMitigation')),
  'export-control': lazy(() => import('./tools/reference/ExportControl')),
  'glossary': lazy(() => import('./tools/reference/Glossary')),
  'faq': lazy(() => import('./tools/reference/Faq')),
  'cybersecurity-guide': lazy(() => import('./tools/operational-security/CybersecurityGuide')),
  'about': lazy(() => import('./tools/reference/About')),
};

function getHashRoute() {
  const hash = window.location.hash.replace('#', '').replace('/', '');
  return hash || null;
}

function ErrorFallback({ onReset }) {
  return (
    <div className="error-fallback">
      <h2>Something went wrong</h2>
      <p>The tool could not be loaded. Reload this page to get the current version; temporary work will be lost. Saved worksheets remain available through an explicit resume.</p>
      <a href="https://science.gc.ca/site/science/en/safeguarding-your-research" target="_blank" rel="noopener noreferrer">Official research-security resources</a>
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
  const { state, update } = useAssessment();
  const [currentRoute, setCurrentRoute] = useState(getHashRoute);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const tool = ALL_TOOLS.find(t => t.slug === currentRoute);
    document.title = (tool?.name || (currentRoute === 'about' ? 'About, Privacy and Sources' : currentRoute ? 'Page unavailable' : 'Home')) + ' | Research Security Toolkit';
    const main = document.getElementById('main-content');
    main?.focus();
    if (main) main.scrollTop = 0;
  }, [currentRoute]);

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
  const disabled = releaseStatus.disabledTools.includes(currentRoute);
  const ToolComponent = currentRoute && !disabled ? TOOL_COMPONENTS[currentRoute] : null;

  return (
    <div className="app">
      <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a>
      <Topbar
        onMenuToggle={() => setSidebarOpen(prev => !prev)}
        showMenuButton={isMobile}
        onLogoClick={goHome}
        onSearchOpen={() => setSearchOpen(true)}
        menuOpen={sidebarOpen}
      />
      <div className="app-body">
        <Sidebar
          currentToolId={currentTool?.id}
          onNavigate={navigate}
          isOpen={isMobile ? sidebarOpen : true}
          onClose={() => setSidebarOpen(false)}
        />
        <MainContent>
          <div className="context-bar screen-only">
            <label htmlFor="institution-context">Institution context</label>
            <select id="institution-context" value={state.institution} onChange={event => update({ institution: event.target.value })}><option value="other">Other / general Canadian guidance</option><option value="lakehead">Lakehead University</option></select>
            <button onClick={() => navigate('about')}>About, privacy and sources</button>
            <span>{releaseStatus.stage} · {releaseStatus.version}</span>
          </div>
          <ErrorBoundary onReset={goHome} key={currentRoute}>
            {ToolComponent ? (
              <Suspense fallback={<div className="loading">Loading tool...</div>}>
                <ToolComponent onNavigate={navigate} />
              </Suspense>
            ) : currentRoute ? (
              <div className="tool-page"><h1>{disabled ? 'Tool unavailable' : 'Page not found'}</h1><p>{disabled ? 'This tool is excluded from the current release.' : 'The requested route does not identify a toolkit page.'}</p><button onClick={goHome}>Go Home</button><button onClick={() => navigate('about')}>Official sources and help</button></div>
            ) : (
              <Home onNavigate={navigate} />
            )}
          </ErrorBoundary>
        </MainContent>
      </div>
      {searchOpen && <GlobalSearchModal
        onClose={() => setSearchOpen(false)}
        onNavigate={navigate}
      />}
    </div>
  );
}
