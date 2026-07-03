// Wraps every order-status state (loading / found / not-found) in the brand theme.
export default function OrderStatusLayout({ children }: { children: React.ReactNode }) {
  return <div className="app-theme min-h-screen">{children}</div>
}
