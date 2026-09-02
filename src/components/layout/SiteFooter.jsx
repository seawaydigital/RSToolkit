// Sits outside <main> deliberately: a <footer> nested inside main does not map
// to the contentinfo landmark, so placing it here is what makes it one.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer-disclaimer">
        Guidance only &mdash; not legal advice.
      </p>
      <p className="site-footer-a11y">
        <span className="site-footer-a11y-label">Accessibility:</span> this site targets WCAG 2.0 AA.{' '}
        <a href="mailto:andrew@seawaydigital.ca?subject=Research%20Security%20Toolkit%20%E2%80%94%20accessibility">
          Report a barrier or request another format
        </a>
      </p>
    </footer>
  );
}
