import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Users as UsersIcon, Mail, Calendar, Shield, Bell, BellOff, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export default function Users() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/users/me`, getAuthHeaders());
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Kullanıcı bilgisi alınamadı");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`, getAuthHeaders());
      setUsers(response.data);
    } catch (error) {
      toast.error("Kullanıcılar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminToggle = async (userId, currentValue) => {
    if (!currentUser?.is_admin) {
      toast.error("Bu işlem için admin yetkisi gerekli");
      return;
    }

    try {
      await axios.put(
        `${API}/users/${userId}`,
        { is_admin: !currentValue },
        getAuthHeaders()
      );
      toast.success("Admin yetkisi güncellendi");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Yetki güncellenemedi");
    }
  };

  const handleNotificationToggle = async (userId, currentValue) => {
    if (!currentUser?.is_admin) {
      toast.error("Bu işlem için admin yetkisi gerekli");
      return;
    }

    try {
      await axios.put(
        `${API}/users/${userId}`,
        { receive_notifications: !currentValue },
        getAuthHeaders()
      );
      toast.success("Bildirim ayarı güncellendi");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Ayar güncellenemedi");
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!currentUser?.is_admin) {
      toast.error("Bu işlem için admin yetkisi gerekli");
      return;
    }

    if (!window.confirm(`"${username}" kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      await axios.delete(`${API}/users/${userId}`, getAuthHeaders());
      toast.success(`${username} kullanıcısı başarıyla silindi`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Kullanıcı silinemedi");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const isAdmin = currentUser?.is_admin;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="users-page">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Kullanıcılar</h1>
        <p className="text-slate-600">Sistemdeki tüm kullanıcılar ve yetkileri</p>
        {!isAdmin && (
          <p className="text-orange-600 text-sm mt-2">⚠️ Kullanıcı ayarlarını değiştirmek için admin yetkisi gerekli</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            data-testid={`user-card-${user.id}`}
            className={`bg-white p-6 rounded-xl shadow-sm border-2 card-hover ${
              user.is_admin ? 'border-blue-500' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                user.is_admin ? 'bg-blue-600' : 'bg-slate-100'
              }`}>
                {user.is_admin ? (
                  <Shield className="w-6 h-6 text-white" />
                ) : (
                  <UsersIcon className="w-6 h-6 text-slate-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{user.username}</h3>
                  {user.is_admin && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-200">
              {/* Admin Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor={`admin-${user.id}`} className="flex items-center gap-2 cursor-pointer">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium">Admin Yetkisi</span>
                </Label>
                <Switch
                  id={`admin-${user.id}`}
                  checked={user.is_admin}
                  onCheckedChange={() => handleAdminToggle(user.id, user.is_admin)}
                  disabled={!isAdmin}
                  data-testid={`admin-switch-${user.id}`}
                />
              </div>

              {/* Notification Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor={`notif-${user.id}`} className="flex items-center gap-2 cursor-pointer">
                  {user.receive_notifications ? (
                    <Bell className="w-4 h-4 text-green-600" />
                  ) : (
                    <BellOff className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-sm font-medium">Email Bildirimi</span>
                </Label>
                <Switch
                  id={`notif-${user.id}`}
                  checked={user.receive_notifications}
                  onCheckedChange={() => handleNotificationToggle(user.id, user.receive_notifications)}
                  disabled={!isAdmin}
                  data-testid={`notification-switch-${user.id}`}
                />
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
              <Calendar className="w-3 h-3" />
              Kayıt: {new Date(user.created_at).toLocaleDateString('tr-TR')}
            </div>

            {user.id === currentUser?.id && (
              <div className="mt-2 text-xs text-blue-600 font-medium">
                (Siz)
              </div>
            )}
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <p className="text-center text-slate-500 py-8">Kullanıcı bulunamadı</p>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📧 Email Bildirim Sistemi</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Bildirim açık olan tüm kullanıcılara otomatik email gönderilir</li>
          <li>• Fatura vade tarihinden 2 gün önce hatırlatma yapılır</li>
          <li>• Her gün saat 12:00'de otomatik kontrol edilir (Türkiye saati)</li>
          <li>• Bildirim almak istemeyenler için toggle kapatılabilir</li>
        </ul>
      </div>
    </div>
  );
}
