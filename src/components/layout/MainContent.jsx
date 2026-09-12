export default function MainContent({ children, inert }) {
  return (
    <main className="main-content" id="main-content" tabIndex={-1} inert={inert}>
      {children}
    </main>
  );
}
