// Wraps every review state (form / already-submitted / error) in the brand theme.
export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return <div className="app-theme min-h-screen">{children}</div>
}
