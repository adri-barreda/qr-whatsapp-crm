import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/contacts", label: "Contactos" },
  { href: "/dashboard/campaigns", label: "Campañas" },
  { href: "/dashboard/qr", label: "Generar QR" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-white border-r p-4 space-y-1">
        <h2 className="font-bold text-lg mb-4 px-3">CRM</h2>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded-lg text-sm hover:bg-gray-100"
          >
            {item.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
