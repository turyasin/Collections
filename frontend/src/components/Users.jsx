import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Users as UsersIcon, Mail, Calendar } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="users-page">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Kullanıcılar</h1>
        <p className="text-slate-600">Sistemdeki tüm kullanıcılar ve aktiviteleri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            data-testid={`user-card-${user.id}`}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 card-hover"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{user.username}</h3>
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              Kayıt: {new Date(user.created_at).toLocaleDateString('tr-TR')}
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <p className="text-center text-slate-500 py-8">Kullanıcı bulunamadı</p>
      )}
    </div>
  );
}
