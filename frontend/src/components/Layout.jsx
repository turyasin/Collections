import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, FileText, CreditCard, Receipt, CalendarDays, UserCircle, LogOut, ArrowDownUp, Building2, Archive } from "lucide-react";

export default function Layout({ children, onLogout, user }) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Kontrol Paneli", icon: LayoutDashboard },
    { path: "/customers", label: "Müşteriler", icon: Users },
    { path: "/invoices", label: "Faturalar", icon: FileText },
    { path: "/payments", label: "Ödemeler", icon: CreditCard },
    { path: "/checks", label: "Çekler", icon: Receipt },
    { path: "/weekly-schedule", label: "Haftalık Program", icon: CalendarDays },
    { path: "/company-info", label: "Firma Bilgileri", icon: Building2, adminOnly: true },
    { path: "/import-export", label: "İçe/Dışa Aktarım", icon: ArrowDownUp },
    { path: "/archive", label: "Arşiv", icon: Archive, adminOnly: true },
    { path: "/users", label: "Kullanıcılar", icon: UserCircle },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-900">Ödeme Takip</h1>
          <p className="text-sm text-slate-600 mt-1">Ödeme Yönetimi</p>
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            // Hide admin-only items if user is not admin
            if (item.adminOnly && !user?.is_admin) return null;
            
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-3 right-3">
          <Button
            onClick={onLogout}
            data-testid="logout-button"
            variant="outline"
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Çıkış
          </Button>
        </div>
      </aside>

      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
