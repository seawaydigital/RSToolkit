import { useEffect } from 'react';
import { Menu, Search } from 'lucide-react';

export default function Topbar({ onMenuToggle, showMenuButton, onLogoClick, onSearchOpen, menuOpen }) {
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onSearchOpen();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onSearchOpen]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        {showMenuButton && (
          <button className="topbar-menu-btn" onClick={onMenuToggle} aria-label="Toggle sidebar" aria-expanded={menuOpen} aria-controls="tool-navigation">
            <Menu size={20} />
          </button>
        )}
        <button className="topbar-logo" onClick={onLogoClick} aria-label="Research Security Toolkit home">
          <span className="topbar-logo-mark">RS</span>
          <span className="topbar-logo-word">Toolkit</span>
        </button>
        <span className="topbar-divider" aria-hidden="true"></span>
        <span className="topbar-subtitle">Research Security</span>
      </div>
      <div className="topbar-right">
        <button
          className="topbar-search-btn"
          onClick={event => { event.currentTarget.focus(); onSearchOpen(); }}
          aria-label="Find a tool (Ctrl+K)"
          title="Find a tool (Ctrl+K)"
        >
          <Search size={15} />
          <span className="topbar-search-label">Find a tool</span>
          <kbd className="topbar-search-kbd">Ctrl K</kbd>
        </button>
        <span className="topbar-badge">Canadian sources</span>
      </div>
    </header>
  );
}
