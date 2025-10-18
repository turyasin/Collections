import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, FileText, CreditCard, Receipt, CalendarDays, UserCircle, LogOut, ArrowDownUp, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export default function Layout({ children, onLogout }) {
  const location = useLocation();
  const [logo, setLogo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchLogo();
    fetchCurrentUser();
  }, []);

  const fetchLogo = async () => {
    try {
      const response = await axios.get(`${API}/settings/logo`, {
        ...getAuthHeaders(),
        responseType: 'blob'
      });
      const imageUrl = URL.createObjectURL(response.data);
      setLogo(imageUrl);
    } catch (error) {
      setLogo(null);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/users/me`, getAuthHeaders());
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  const navItems = [
    { path: "/", label: "Kontrol Paneli", icon: LayoutDashboard },
    { path: "/customers", label: "Müşteriler", icon: Users },
    { path: "/invoices", label: "Faturalar", icon: FileText },
    { path: "/payments", label: "Ödemeler", icon: CreditCard },
    { path: "/checks", label: "Çekler", icon: Receipt },
    { path: "/weekly-schedule", label: "Haftalık Program", icon: CalendarDays },
    { path: "/import-export", label: "İçe/Dışa Aktarım", icon: ArrowDownUp },
    { path: "/users", label: "Kullanıcılar", icon: UserCircle },
  ];

  // Admin kullanıcılar için Ayarlar menüsü ekle
  if (currentUser?.is_admin) {
    navItems.push({ path: "/settings", label: "Ayarlar", icon: Settings });
  }

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
