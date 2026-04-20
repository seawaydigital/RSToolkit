import { useEffect } from 'react';
import { Menu, Search } from 'lucide-react';

export default function Topbar({ onMenuToggle, showMenuButton, onLogoClick, onSearchOpen }) {
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
          <button className="topbar-menu-btn" onClick={onMenuToggle} aria-label="Toggle sidebar">
            <Menu size={20} />
          </button>
        )}
        <span className="topbar-logo" onClick={onLogoClick} style={{ cursor: 'pointer' }}>
          <span className="topbar-logo-mark">RS</span>
          <span className="topbar-logo-word">Toolkit</span>
        </span>
        <span className="topbar-divider" aria-hidden="true"></span>
        <span className="topbar-subtitle">Research Security</span>
      </div>
      <div className="topbar-right">
        <button
          className="topbar-search-btn"
          onClick={onSearchOpen}
          aria-label="Search tools (Ctrl+K)"
          title="Search tools (Ctrl+K)"
        >
          <Search size={15} />
          <span className="topbar-search-label">Search tools</span>
          <kbd className="topbar-search-kbd">Ctrl K</kbd>
        </button>
        <span className="topbar-badge">Canadian sources</span>
      </div>
    </header>
  );
}
