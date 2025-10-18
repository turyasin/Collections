import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Users, Building } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function Customers() {
  const [activeTab, setActiveTab] = useState("customers");
  const [currentUser, setCurrentUser] = useState(null);
  
  // Customers state
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customerFormData, setCustomerFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Suppliers state
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [supplierFormData, setSupplierFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    discount_rate: 0,
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchCustomers();
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

  // Customer functions
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`, getAuthHeaders());
      setCustomers(response.data);
    } catch (error) {
      toast.error("Müşteriler yüklenemedi");
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await axios.put(`${API}/customers/${editingCustomer.id}`, customerFormData, getAuthHeaders());
        toast.success("Müşteri güncellendi");
      } else {
        await axios.post(`${API}/customers`, customerFormData, getAuthHeaders());
        toast.success("Müşteri eklendi");
      }
      setCustomerDialogOpen(false);
      setEditingCustomer(null);
      setCustomerFormData({ name: "", email: "", phone: "", address: "" });
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "İşlem başarısız");
    }
  };

  const handleCustomerEdit = (customer) => {
    setEditingCustomer(customer);
    setCustomerFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });
    setCustomerDialogOpen(true);
  };

  const handleCustomerDelete = async (id) => {
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
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  // Supplier functions
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API}/suppliers`, getAuthHeaders());
      setSuppliers(response.data);
    } catch (error) {
      toast.error("Tedarikçiler yüklenemedi");
    } finally {
      setSuppliersLoading(false);
    }
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await axios.put(`${API}/suppliers/${editingSupplier.id}`, supplierFormData, getAuthHeaders());
        toast.success("Tedarikçi güncellendi");
      } else {
        await axios.post(`${API}/suppliers`, supplierFormData, getAuthHeaders());
        toast.success("Tedarikçi eklendi");
      }
      setSupplierDialogOpen(false);
      setEditingSupplier(null);
      setSupplierFormData({ name: "", email: "", phone: "", address: "", discount_rate: 0 });
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "İşlem başarısız");
    }
  };

  const handleSupplierEdit = (supplier) => {
    setEditingSupplier(supplier);
    setSupplierFormData({
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      discount_rate: supplier.discount_rate || 0,
    });
    setSupplierDialogOpen(true);
  };

  const handleSupplierDelete = async (id) => {
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
    supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Müşteriler ve Tedarikçiler</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Müşteriler
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Tedarikçi Firmalar
          </TabsTrigger>
        </TabsList>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Müşteri ara..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingCustomer(null);
                      setCustomerFormData({ name: "", email: "", phone: "", address: "" });
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
                  <form onSubmit={handleCustomerSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer-name">Müşteri Adı *</Label>
                      <Input
                        id="customer-name"
                        value={customerFormData.name}
                        onChange={(e) => setCustomerFormData({ ...customerFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer-email">E-posta</Label>
                      <Input
                        id="customer-email"
                        type="email"
                        value={customerFormData.email}
                        onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer-phone">Telefon</Label>
                      <Input
                        id="customer-phone"
                        value={customerFormData.phone}
                        onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customer-address">Adres</Label>
                      <Input
                        id="customer-address"
                        value={customerFormData.address}
                        onChange={(e) => setCustomerFormData({ ...customerFormData, address: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setCustomerDialogOpen(false)}>
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

            {customersLoading ? (
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
                              onClick={() => handleCustomerEdit(customer)}
                              className="hover:bg-blue-50"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCustomerDelete(customer.id)}
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
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Tedarikçi ara..."
                  value={supplierSearchTerm}
                  onChange={(e) => setSupplierSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingSupplier(null);
                      setSupplierFormData({ name: "", email: "", phone: "", address: "", discount_rate: 0 });
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
                  <form onSubmit={handleSupplierSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier-name">Firma Adı *</Label>
                      <Input
                        id="supplier-name"
                        value={supplierFormData.name}
                        onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
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
                        value={supplierFormData.discount_rate}
                        onChange={(e) => setSupplierFormData({ ...supplierFormData, discount_rate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier-email">E-posta</Label>
                      <Input
                        id="supplier-email"
                        type="email"
                        value={supplierFormData.email}
                        onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier-phone">Telefon</Label>
                      <Input
                        id="supplier-phone"
                        value={supplierFormData.phone}
                        onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier-address">Adres</Label>
                      <Input
                        id="supplier-address"
                        value={supplierFormData.address}
                        onChange={(e) => setSupplierFormData({ ...supplierFormData, address: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setSupplierDialogOpen(false)}>
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

            {suppliersLoading ? (
              <div className="text-center py-8">Yükleniyor...</div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Tedarikçi bulunamadı</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Firma Adı</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">İskonto %</th>
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
                        <td className="py-3 px-4">
                          <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                            %{supplier.discount_rate || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">{supplier.email || "-"}</td>
                        <td className="py-3 px-4">{supplier.phone || "-"}</td>
                        <td className="py-3 px-4">{supplier.address || "-"}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSupplierEdit(supplier)}
                              className="hover:bg-green-50"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSupplierDelete(supplier.id)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
