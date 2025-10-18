import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export default function Settings() {
  const [logo, setLogo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchLogo();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/users/me`, getAuthHeaders());
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  const fetchLogo = async () => {
    try {
      const response = await axios.get(`${API}/settings/logo`, {
        ...getAuthHeaders(),
        responseType: 'blob'
      });
      if (response.status === 200 && response.data.size > 0) {
        const imageUrl = URL.createObjectURL(response.data);
        setLogo(imageUrl);
      } else {
        setLogo(null);
      }
    } catch (error) {
      // Logo doesn't exist yet - silently handle
      console.log('Logo not available:', error.response?.status);
      setLogo(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Lütfen bir resim dosyası seçin");
        return;
      }
      if (!file.name.toLowerCase().endsWith('.png')) {
        toast.error("Sadece PNG formatı desteklenmektedir");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Lütfen bir dosya seçin");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await axios.post(`${API}/settings/logo`, formData, {
        headers: {
          ...getAuthHeaders().headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success("Logo başarıyla yüklendi");
      setSelectedFile(null);
      fetchLogo();
      // Reload page to update logo in navbar
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Logo yüklenemedi");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Logoyu silmek istediğinizden emin misiniz?")) return;

    try {
      await axios.delete(`${API}/settings/logo`, getAuthHeaders());
      toast.success("Logo başarıyla silindi");
      setLogo(null);
      // Reload page to update logo in navbar
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Logo silinemedi");
    }
  };

  if (!currentUser?.is_admin) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Ayarlar</h1>
          <p className="text-slate-600">Uygulama ayarlarını yönetin</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-600">Bu sayfaya erişim için admin yetkisi gereklidir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Ayarlar</h1>
        <p className="text-slate-600">Uygulama ayarlarını yönetin</p>
      </div>

      {/* Logo Management */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Logo Yönetimi</h2>
        <p className="text-sm text-slate-600 mb-6">
          Uygulamanın sol üst köşesinde görünecek PNG formatında logo yükleyin. Önerilen boyut: 200x200px
        </p>

        {/* Current Logo */}
        <div className="mb-6">
          <Label className="mb-2 block">Mevcut Logo</Label>
          {logo ? (
            <div className="flex items-center gap-4">
              <div className="w-48 h-48 border-2 border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden">
                <img src={logo} alt="Company Logo" className="max-w-full max-h-full object-contain" />
              </div>
              <Button 
                variant="outline" 
                className="text-red-600 hover:bg-red-50" 
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Logoyu Sil
              </Button>
            </div>
          ) : (
            <div className="w-48 h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center bg-slate-50">
              <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">Logo yüklenmedi</p>
            </div>
          )}
        </div>

        {/* Upload New Logo */}
        <div className="space-y-4">
          <Label>Yeni Logo Yükle</Label>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/png"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Yükleniyor..." : "Yükle"}
            </Button>
          </div>
          {selectedFile && (
            <p className="text-sm text-green-600">Seçili dosya: {selectedFile.name}</p>
          )}
          <p className="text-xs text-slate-500">
            • Sadece PNG formatı desteklenmektedir<br />
            • Maksimum dosya boyutu: 5MB<br />
            • Önerilen boyut: 200x200px (kare logo)
          </p>
        </div>
      </div>
    </div>
  );
}
