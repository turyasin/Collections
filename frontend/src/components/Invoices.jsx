import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Download, Upload } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [quarterFilter, setQuarterFilter] = useState("all");
  const [formData, setFormData] = useState({ customer_id: "", invoice_number: "", amount: "", due_date: "", notes: "" });
  const [exportFormat, setExportFormat] = useState("xlsx");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API}/invoices`, getAuthHeaders());
      setInvoices(response.data);
    } catch (error) {
      toast.error("Faturalar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`, getAuthHeaders());
      setCustomers(response.data);
    } catch (error) {
      toast.error("Müşteriler yüklenemedi");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      if (editingInvoice) {
        await axios.put(`${API}/invoices/${editingInvoice.id}`, payload, getAuthHeaders());
        toast.success("Fatura güncellendi");
      } else {
        await axios.post(`${API}/invoices`, payload, getAuthHeaders());
        toast.success("Fatura oluşturuldu");
      }
      setDialogOpen(false);
      resetForm();
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Fatura kaydedilemedi");
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({ customer_id: invoice.customer_id, invoice_number: invoice.invoice_number, amount: invoice.amount.toString(), due_date: invoice.due_date, notes: invoice.notes || "" });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu faturayı silmek istediğinizden emin misiniz?")) return;
    try {
      await axios.delete(`${API}/invoices/${id}`, getAuthHeaders());
      toast.success("Fatura silindi");
      fetchInvoices();
    } catch (error) {
      toast.error("Fatura silinemedi");
    }
  };

  const resetForm = () => {
    setFormData({ customer_id: "", invoice_number: "", amount: "", due_date: "", notes: "" });
    setEditingInvoice(null);
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`${API}/export/invoices?format=${format}`, {
        ...getAuthHeaders(),
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileExtension = format === 'xlsx' ? 'xlsx' : format === 'docx' ? 'docx' : 'pdf';
      link.setAttribute('download', `faturalar_${new Date().toISOString().split('T')[0]}.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Faturalar ${format.toUpperCase()} formatında indirildi`);
    } catch (error) {
      toast.error("Dışa aktarma başarısız oldu");
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Lütfen bir dosya seçin");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await axios.post(`${API}/import/invoices`, formData, {
        headers: {
          ...getAuthHeaders().headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success("Faturalar başarıyla içe aktarıldı");
      setImportDialogOpen(false);
      setSelectedFile(null);
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.detail || "İçe aktarma başarısız oldu");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      setSelectedFile(file);
    } else {
      toast.error("Sadece .xlsx dosyaları desteklenmektedir");
      e.target.value = null;
    }
  };

  // Get unique months and quarters from invoices
  const uniqueMonths = [...new Set(invoices.map(inv => inv.month).filter(Boolean))].sort();
  const uniqueQuarters = [...new Set(invoices.map(inv => inv.quarter).filter(Boolean))].sort();

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || (invoice.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesMonth = monthFilter === "all" || invoice.month === monthFilter;
    const matchesQuarter = quarterFilter === "all" || invoice.quarter === quarterFilter;
    return matchesSearch && matchesStatus && matchesMonth && matchesQuarter;
  });

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="invoices-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Faturalar</h1>
          <p className="text-slate-600">Tüm faturaları takip edin ve yönetin</p>
        </div>
        <div className="flex gap-2">
          {/* Export Dropdown */}
          <div className="relative inline-block text-left">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  <Download className="w-4 h-4 mr-2" />
                  Dışa Aktar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" aria-describedby="export-dialog-description">
                <DialogHeader>
                  <DialogTitle>Faturalar Dışa Aktar</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p id="export-dialog-description" className="text-sm text-slate-600">Dışa aktarma formatını seçin:</p>
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => handleExport('xlsx')} className="bg-green-600 hover:bg-green-700">
                      Excel (.xlsx)
                    </Button>
                    <Button onClick={() => handleExport('docx')} className="bg-blue-600 hover:bg-blue-700">
                      Word (.docx)
                    </Button>
                    <Button onClick={() => handleExport('pdf')} className="bg-red-600 hover:bg-red-700">
                      PDF (.pdf)
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Import Button */}
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                <Upload className="w-4 h-4 mr-2" />
                İçe Aktar
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="import-dialog-description">
              <DialogHeader>
                <DialogTitle>Faturalar İçe Aktar</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p id="import-dialog-description" className="text-sm text-slate-600">
                  Excel (.xlsx) dosyası yükleyin. Dosya aşağıdaki sütunları içermelidir:
                  customer_id, customer_name, invoice_number, amount, paid_amount, due_date, status, notes
                </p>
                <Input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <p className="text-sm text-green-600">Seçili dosya: {selectedFile.name}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setImportDialogOpen(false);
                    setSelectedFile(null);
                  }}>
                    İptal
                  </Button>
                  <Button onClick={handleImport} className="bg-purple-600 hover:bg-purple-700">
                    İçe Aktar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="add-invoice-button" className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Fatura Ekle</Button>
            </DialogTrigger>
            <DialogContent data-testid="invoice-dialog" aria-describedby="invoice-dialog-description">
              <DialogHeader><DialogTitle>{editingInvoice ? "Fatura Düzenle" : "Yeni Fatura"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Müşteri *</Label>
                  <Select value={formData.customer_id} onValueChange={(value) => setFormData({ ...formData, customer_id: value })} required>
                    <SelectTrigger data-testid="customer-select"><SelectValue placeholder="Müşteri seçin" /></SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Fatura No *</Label>
                  <Input id="invoice_number" data-testid="invoice-number-input" value={formData.invoice_number} onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Tutar *</Label>
                  <Input id="amount" data-testid="invoice-amount-input" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Vade Tarihi *</Label>
                  <Input id="due_date" data-testid="invoice-due-date-input" type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period_type">Periyot *</Label>
                  <Select value={formData.period_type} onValueChange={(value) => setFormData({ ...formData, period_type: value })} required>
                    <SelectTrigger data-testid="period-select"><SelectValue placeholder="Periyot seçin" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aylık">Aylık</SelectItem>
                      <SelectItem value="3 Aylık">3 Aylık</SelectItem>
                      <SelectItem value="Yıllık">Yıllık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notlar</Label>
                  <Input id="notes" data-testid="invoice-notes-input" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
                  <Button type="submit" data-testid="save-invoice-button" className="bg-blue-600 hover:bg-blue-700">{editingInvoice ? "Güncelle" : "Oluştur"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input data-testid="search-invoices-input" placeholder="Fatura ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="status-filter"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="paid">Ödendi</SelectItem>
            <SelectItem value="partial">Kısmi</SelectItem>
            <SelectItem value="unpaid">Ödenmedi</SelectItem>
          </SelectContent>
        </Select>
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-40" data-testid="period-filter"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Periyotlar</SelectItem>
            <SelectItem value="Aylık">Aylık</SelectItem>
            <SelectItem value="3 Aylık">3 Aylık</SelectItem>
            <SelectItem value="Yıllık">Yıllık</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="custom-table">
          <thead>
            <tr><th>Fatura #</th><th>Müşteri</th><th>Tutar</th><th>Ödendi</th><th>Vade</th><th>Periyot</th><th>Durum</th><th>Ekleyen</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id} data-testid={`invoice-row-${invoice.id}`}>
                  <td className="font-semibold text-slate-900">{invoice.invoice_number}</td>
                  <td className="text-slate-600">{invoice.customer_name || "N/A"}</td>
                  <td className="text-slate-900 font-semibold">₺{invoice.amount.toFixed(2)}</td>
                  <td className="text-green-600 font-semibold">₺{invoice.paid_amount?.toFixed(2) || "0.00"}</td>
                  <td className="text-slate-600">{new Date(invoice.due_date).toLocaleDateString()}</td>
                  <td className="text-slate-600">{invoice.period_type || "Aylık"}</td>
                  <td><span className={`status-badge status-${invoice.status}`} data-testid={`invoice-status-${invoice.id}`}>{invoice.status}</span></td><td className="text-slate-600 text-sm">{invoice.created_by_username || "—"}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" data-testid={`edit-invoice-${invoice.id}`} onClick={() => handleEdit(invoice)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" data-testid={`delete-invoice-${invoice.id}`} className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(invoice.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9" className="text-center py-8 text-slate-500">Fatura bulunamadı</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
