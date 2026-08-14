import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import Home from './components/home/Home';
import { ALL_TOOLS } from './data/toolRegistry';
import GlobalSearchModal from './components/ui/SearchBar';
import './styles/global.css';

const TOOL_COMPONENTS = {
  'tri-agency-guide': lazy(() => import('./tools/policy-guides/TriAgencyGuide')),
  'strac-flowchart': lazy(() => import('./tools/flowcharts/StracFlowchart')),
  'nsgrp-flowchart': lazy(() => import('./tools/flowcharts/NsgrpFlowchart')),
  'ontario-flowchart': lazy(() => import('./tools/flowcharts/OntarioFlowchart')),
  'stra-lookup': lazy(() => import('./tools/compliance/StraLookup')),
  'nro-lookup': lazy(() => import('./tools/compliance/NroLookup')),
  'risk-checklist': lazy(() => import('./tools/compliance/RiskChecklist')),
  'risk-mitigation': lazy(() => import('./tools/compliance/RiskMitigation')),
  'dual-use': lazy(() => import('./tools/compliance/DualUseGuide')),
  'export-control': lazy(() => import('./tools/reference/ExportControl')),
  'glossary': lazy(() => import('./tools/reference/Glossary')),
  'faq': lazy(() => import('./tools/reference/Faq')),
  'cybersecurity-guide': lazy(() => import('./tools/operational-security/CybersecurityGuide')),
};

const SITE_TITLE = 'Research Security Toolkit';

function getHashRoute() {
  const hash = window.location.hash.replace('#', '').replace('/', '');
  return hash || null;
}

function ErrorFallback({ error, onReset }) {
  return (
    <div className="error-fallback">
      <h1>Something went wrong</h1>
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
  // Skip the focus move on first paint — only *navigations* should reposition focus.
  const isFirstRender = useRef(true);

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

  // The document title is the primary way a screen-reader user knows which view
  // they landed on. Hash routing never reloads the document, so we retitle here
  // (WCAG 2.4.2 Page Titled) and move focus to <main> so the new page is
  // announced instead of leaving focus on the link that was just activated.
  useEffect(() => {
    const tool = ALL_TOOLS.find(t => t.slug === currentRoute);
    document.title = tool ? `${tool.name} — ${SITE_TITLE}` : SITE_TITLE;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const main = document.getElementById('main-content');
    if (main) {
      main.focus();
      main.scrollTop = 0;
    }
  }, [currentRoute]);

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
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          // Hash is used for routing, so move focus manually instead of
          // letting the anchor change window.location.hash.
          e.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Skip to main content
      </a>
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
