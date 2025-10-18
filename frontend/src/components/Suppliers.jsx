import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function Suppliers() {
  const [currentUser, setCurrentUser] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    discount_rate: 0,
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchSuppliers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/users/me`, getAuthHeaders());
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Failed to fetch current user");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API}/suppliers`, getAuthHeaders());
      setSuppliers(response.data);
    } catch (error) {
      toast.error("Tedarikçiler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await axios.put(`${API}/suppliers/${editingSupplier.id}`, formData, getAuthHeaders());
        toast.success("Tedarikçi güncellendi");
      } else {
        await axios.post(`${API}/suppliers`, formData, getAuthHeaders());
        toast.success("Tedarikçi eklendi");
      }
      setDialogOpen(false);
      setEditingSupplier(null);
      setFormData({ name: "", email: "", phone: "", address: "", discount_rate: 0 });
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "İşlem başarısız");
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      discount_rate: supplier.discount_rate || 0,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu tedarikçiyi silmek istediğinizden emin misiniz?")) return;
    try {
      await axios.delete(`${API}/suppliers/${id}`, getAuthHeaders());
      toast.success("Tedarikçi silindi");
      fetchSuppliers();
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tedarikçi Firmalar</h1>
          <p className="text-slate-600">Tedarikçi firma bilgilerini yönetin</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Tedarikçi ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingSupplier(null);
                  setFormData({ name: "", email: "", phone: "", address: "", discount_rate: 0 });
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Tedarikçi Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSupplier ? "Tedarikçi Düzenle" : "Yeni Tedarikçi"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier-name">Firma Adı *</Label>
                  <Input
                    id="supplier-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier-discount">İskonto Oranı (%)</Label>
                  <Input
                    id="supplier-discount"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.discount_rate}
                    onChange={(e) => setFormData({ ...formData, discount_rate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier-email">E-posta</Label>
                  <Input
                    id="supplier-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier-phone">Telefon</Label>
                  <Input
                    id="supplier-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier-address">Adres</Label>
                  <Input
                    id="supplier-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {editingSupplier ? "Güncelle" : "Ekle"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">Yükleniyor...</div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Tedarikçi bulunamadı</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Firma Adı</th>
                  {currentUser?.is_admin && (
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">İskonto %</th>
                  )}
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">E-posta</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Telefon</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Adres</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{supplier.name}</td>
                    {currentUser?.is_admin && (
                      <td className="py-3 px-4">
                        <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                          %{supplier.discount_rate || 0}
                        </span>
                      </td>
                    )}
                    <td className="py-3 px-4">{supplier.email || "-"}</td>
                    <td className="py-3 px-4">{supplier.phone || "-"}</td>
                    <td className="py-3 px-4">{supplier.address || "-"}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(supplier)}
                          className="hover:bg-green-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(supplier.id)}
                          className="hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
