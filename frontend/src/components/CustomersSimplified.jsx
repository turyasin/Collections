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

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`, getAuthHeaders());
      setCustomers(response.data);
    } catch (error) {
      toast.error("Müşteriler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await axios.put(`${API}/customers/${editingCustomer.id}`, formData, getAuthHeaders());
        toast.success("Müşteri güncellendi");
      } else {
        await axios.post(`${API}/customers`, formData, getAuthHeaders());
        toast.success("Müşteri eklendi");
      }
      setDialogOpen(false);
      setEditingCustomer(null);
      setFormData({ name: "", email: "", phone: "", address: "" });
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "İşlem başarısız");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu müşteriyi silmek istediğinizden emin misiniz?")) return;
    try {
      await axios.delete(`${API}/customers/${id}`, getAuthHeaders());
      toast.success("Müşteri silindi");
      fetchCustomers();
    } catch (error) {
      toast.error("Silme işlemi başarısız");
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Müşteriler</h1>
          <p className="text-slate-600">Müşteri bilgilerini yönetin</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingCustomer(null);
                  setFormData({ name: "", email: "", phone: "", address: "" });
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Müşteri Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCustomer ? "Müşteri Düzenle" : "Yeni Müşteri"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Müşteri Adı *</Label>
                  <Input
                    id="customer-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-email">E-posta</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-phone">Telefon</Label>
                  <Input
                    id="customer-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-address">Adres</Label>
                  <Input
                    id="customer-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingCustomer ? "Güncelle" : "Ekle"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">Yükleniyor...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Müşteri bulunamadı</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Müşteri Adı</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">E-posta</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Telefon</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Adres</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">{customer.name}</td>
                    <td className="py-3 px-4">{customer.email || "-"}</td>
                    <td className="py-3 px-4">{customer.phone || "-"}</td>
                    <td className="py-3 px-4">{customer.address || "-"}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(customer)}
                          className="hover:bg-blue-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(customer.id)}
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
