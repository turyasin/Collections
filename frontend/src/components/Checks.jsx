import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export default function Checks() {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("received");
  const [formData, setFormData] = useState({
    check_type: "received",
    check_number: "",
    amount: "",
    due_date: "",
    bank_name: "",
    payer_payee: "",
    notes: ""
  });

  useEffect(() => {
    fetchChecks();
  }, []);

  const fetchChecks = async () => {
    try {
      const response = await axios.get(`${API}/checks`, getAuthHeaders());
      setChecks(response.data);
    } catch (error) {
      toast.error("Çekler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      if (editingCheck) {
        await axios.put(`${API}/checks/${editingCheck.id}`, payload, getAuthHeaders());
        toast.success("Çek güncellendi");
      } else {
        await axios.post(`${API}/checks`, payload, getAuthHeaders());
        toast.success("Çek eklendi");
      }
      setDialogOpen(false);
      resetForm();
      fetchChecks();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Çek kaydedilemedi");
    }
  };

  const handleEdit = (check) => {
    setEditingCheck(check);
    setFormData({
      check_type: check.check_type,
      check_number: check.check_number,
      amount: check.amount.toString(),
      due_date: check.due_date,
      bank_name: check.bank_name,
      payer_payee: check.payer_payee,
      notes: check.notes || ""
    });
    setDialogOpen(true);
  };

  const handleStatusChange = async (checkId, newStatus) => {
    try {
      await axios.put(`${API}/checks/${checkId}`, { status: newStatus }, getAuthHeaders());
      toast.success("Durum güncellendi");
      fetchChecks();
    } catch (error) {
      toast.error("Durum güncellenemedi");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu çeki silmek istediğinizden emin misiniz?")) return;
    try {
      await axios.delete(`${API}/checks/${id}`, getAuthHeaders());
      toast.success("Çek silindi");
      fetchChecks();
    } catch (error) {
      toast.error("Çek silinemedi");
    }
  };

  const resetForm = () => {
    setFormData({ check_type: "received", check_number: "", amount: "", due_date: "", bank_name: "", payer_payee: "", notes: "" });
    setEditingCheck(null);
  };

  const filterChecks = (type) => {
    return checks
      .filter(c => c.check_type === type)
      .filter(c => 
        c.check_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.payer_payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.bank_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: "Beklemede", class: "bg-yellow-100 text-yellow-800" },
      collected: { label: "Tahsil Edildi", class: "bg-green-100 text-green-800" },
      paid: { label: "Ödendi", class: "bg-blue-100 text-blue-800" },
      bounced: { label: "Karşılıksız", class: "bg-red-100 text-red-800" }
    };
    const { label, class: className } = statusMap[status] || statusMap.pending;
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${className}`}>{label}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="checks-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Çek Takibi</h1>
          <p className="text-slate-600">Alınan ve verilen çekleri yönetin</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-check-button" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />Çek Ekle
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="check-dialog" aria-describedby="check-dialog-description">
            <DialogHeader>
              <DialogTitle>{editingCheck ? "Çek Düzenle" : "Yeni Çek"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Çek Tipi *</Label>
                <Select value={formData.check_type} onValueChange={(value) => setFormData({ ...formData, check_type: value })} required>
                  <SelectTrigger data-testid="check-type-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Alınan Çek</SelectItem>
                    <SelectItem value="issued">Verilen Çek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Çek No *</Label>
                <Input data-testid="check-number-input" value={formData.check_number} onChange={(e) => setFormData({ ...formData, check_number: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Tutar (₺) *</Label>
                <Input data-testid="check-amount-input" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Vade Tarihi *</Label>
                <Input data-testid="check-due-date-input" type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Banka *</Label>
                <Input data-testid="check-bank-input" value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>{formData.check_type === "received" ? "Ödeyici" : "Alacaklı"} *</Label>
                <Input data-testid="check-payer-input" value={formData.payer_payee} onChange={(e) => setFormData({ ...formData, payer_payee: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Notlar</Label>
                <Input data-testid="check-notes-input" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
                <Button type="submit" data-testid="save-check-button" className="bg-blue-600 hover:bg-blue-700">{editingCheck ? "Güncelle" : "Kaydet"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input data-testid="search-checks-input" placeholder="Çek ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" data-testid="received-tab">Alınan Çekler ({filterChecks("received").length})</TabsTrigger>
          <TabsTrigger value="issued" data-testid="issued-tab">Verilen Çekler ({filterChecks("issued").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="custom-table">
              <thead>
                <tr><th>Çek No</th><th>Ödeyici</th><th>Banka</th><th>Tutar</th><th>Vade</th><th>Durum</th><th>Ekleyen</th><th>İşlemler</th></tr>
              </thead>
              <tbody>
                {filterChecks("received").length > 0 ? (
                  filterChecks("received").map((check) => (
                    <tr key={check.id} data-testid={`check-row-${check.id}`}>
                      <td className="font-semibold text-slate-900">{check.check_number}</td>
                      <td className="text-slate-600">{check.payer_payee}</td>
                      <td className="text-slate-600">{check.bank_name}</td>
                      <td className="text-green-600 font-bold">₺{check.amount.toFixed(2)}</td>
                      <td className="text-slate-600">{new Date(check.due_date).toLocaleDateString('tr-TR')}</td>
                      <td>
                        <Select value={check.status} onValueChange={(value) => handleStatusChange(check.id, value)}>
                          <SelectTrigger className="w-40">{getStatusBadge(check.status)}</SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Beklemede</SelectItem>
                            <SelectItem value="collected">Tahsil Edildi</SelectItem>
                            <SelectItem value="bounced">Karşılıksız</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="text-slate-600 text-sm">{check.created_by_username || "—"}</td>
                      <td>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(check)}><Pencil className="w-4 h-4" /></Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(check.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" className="text-center py-8 text-slate-500">Alınan çek bulunamadı</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="issued" className="mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="custom-table">
              <thead>
                <tr><th>Çek No</th><th>Alacaklı</th><th>Banka</th><th>Tutar</th><th>Vade</th><th>Durum</th><th>Ekleyen</th><th>İşlemler</th></tr>
              </thead>
              <tbody>
                {filterChecks("issued").length > 0 ? (
                  filterChecks("issued").map((check) => (
                    <tr key={check.id} data-testid={`check-row-${check.id}`}>
                      <td className="font-semibold text-slate-900">{check.check_number}</td>
                      <td className="text-slate-600">{check.payer_payee}</td>
                      <td className="text-slate-600">{check.bank_name}</td>
                      <td className="text-red-600 font-bold">₺{check.amount.toFixed(2)}</td>
                      <td className="text-slate-600">{new Date(check.due_date).toLocaleDateString('tr-TR')}</td>
                      <td>
                        <Select value={check.status} onValueChange={(value) => handleStatusChange(check.id, value)}>
                          <SelectTrigger className="w-40">{getStatusBadge(check.status)}</SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Beklemede</SelectItem>
                            <SelectItem value="paid">Ödendi</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(check)}><Pencil className="w-4 h-4" /></Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(check.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" className="text-center py-8 text-slate-500">Verilen çek bulunamadı</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
