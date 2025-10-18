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
      resetForm();
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Müşteri kaydedilemedi");
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
      toast.error("Müşteri silinemedi");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", address: "" });
    setEditingCustomer(null);
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="customers-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Müşteriler</h1>
          <p className="text-slate-600">Müşteri veritabanınızı yönetin</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-customer-button" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="customer-dialog" aria-describedby="customer-dialog-description">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Müşteri Düzenle" : "Yeni Müşteri"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad *</Label>
                <Input id="name" data-testid="customer-name-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" data-testid="customer-email-input" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" data-testid="customer-phone-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Input id="address" data-testid="customer-address-input" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
                <Button type="submit" data-testid="save-customer-button" className="bg-blue-600 hover:bg-blue-700">{editingCustomer ? "Güncelle" : "Kaydet"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input data-testid="search-customers-input" placeholder="Müşteri ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Ad</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Adres</th>
              <th>Ekleyen</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} data-testid={`customer-row-${customer.id}`}>
                  <td className="font-semibold text-slate-900">{customer.name}</td>
                  <td className="text-slate-600">{customer.email || "—"}</td>
                  <td className="text-slate-600">{customer.phone || "—"}</td>
                  <td className="text-slate-600">{customer.address || "—"}</td>
                  <td className="text-slate-600 text-sm">{customer.created_by_username || "—"}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" data-testid={`edit-customer-${customer.id}`} onClick={() => handleEdit(customer)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" data-testid={`delete-customer-${customer.id}`} className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(customer.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-500">Müşteri bulunamadı</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
