import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LayoutDashboard, Users, FileText, CreditCard, Receipt, CalendarDays, UserCircle, LogOut, ArrowDownUp, Building2, Archive, Menu, X, KeyRound, Truck, Wallet } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function Layout({ children, onLogout, user }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor");
      return;
    }
    
    if (passwordFormData.newPassword.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalıdır");
      return;
    }
    
    try {
      await axios.post(`${API}/users/change-password`, {
        current_password: passwordFormData.currentPassword,
        new_password: passwordFormData.newPassword,
      }, getAuthHeaders());
      
      toast.success("Şifre başarıyla değiştirildi");
      setPasswordDialogOpen(false);
      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Şifre değiştirme başarısız");
    }
  };

  const navItems = [
    { path: "/", label: "Kontrol Paneli", icon: LayoutDashboard },
    { path: "/customers", label: "Müşteriler", icon: Users },
    { path: "/suppliers", label: "Tedarikçiler", icon: Truck },
    { path: "/invoices", label: "Faturalar", icon: FileText },
    { path: "/payments", label: "Ödemeler", icon: CreditCard },
    { path: "/checks", label: "Çekler", icon: Receipt },
    { path: "/weekly-schedule", label: "Haftalık Program", icon: CalendarDays },
    { path: "/company-info", label: "Firma Bilgileri", icon: Building2 },
    { path: "/import-export", label: "İçe/Dışa Aktarım", icon: ArrowDownUp },
    { path: "/archive", label: "Arşiv", icon: Archive, adminOnly: true },
    { path: "/users", label: "Kullanıcılar", icon: UserCircle },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center px-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="ml-3 text-xl font-bold text-slate-900">Ödeme Takip</h1>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Close button for mobile */}
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={closeSidebar}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
        </div>

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
                onClick={closeSidebar}
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
          {user && (
            <div className="mb-3 px-4 py-3 bg-slate-100 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Kullanıcı</p>
              <p className="text-sm font-semibold text-slate-900">{user.username}</p>
              {user.is_admin && (
                <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Admin</span>
              )}
            </div>
          )}
          
          {/* Şifre Değiştir Butonu */}
          <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start mb-2 border-slate-200 hover:bg-slate-50"
              >
                <KeyRound className="w-5 h-5 mr-3" />
                Şifre Değiştir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Şifre Değiştir</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mevcut Şifre</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordFormData.currentPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Yeni Şifre</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordFormData.newPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordFormData.confirmPassword}
                    onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Değiştir
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
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

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
