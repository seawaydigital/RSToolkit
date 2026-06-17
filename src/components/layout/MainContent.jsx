export default function MainContent({ children }) {
  return (
    <main className="main-content" id="main-content" tabIndex={-1}>
      {children}
    </main>
  );
}
