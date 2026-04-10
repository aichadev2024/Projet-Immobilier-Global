export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout minimal sans sidebar pour les pages auth admin
  return <>{children}</>;
}
