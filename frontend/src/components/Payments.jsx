import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Search, Download, Upload } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({ invoice_id: "", check_number: "", check_date: "", bank_name: "", amount: "", period_type: "Aylık" });

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API}/payments`, getAuthHeaders());
      setPayments(response.data);
    } catch (error) {
      toast.error("Ödemeler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API}/invoices`, getAuthHeaders());
      const unpaidInvoices = response.data.filter((inv) => inv.status === "unpaid" || inv.status === "partial");
      setInvoices(unpaidInvoices);
    } catch (error) {
      toast.error("Faturalar yüklenemedi");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      await axios.post(`${API}/payments`, payload, getAuthHeaders());
      toast.success("Ödeme kaydedildi");
      setDialogOpen(false);
      resetForm();
      fetchPayments();
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Ödeme kaydedilemedi");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu ödemeyi silmek istediğinizden emin misiniz?")) return;
    try {
      await axios.delete(`${API}/payments/${id}`, getAuthHeaders());
      toast.success("Ödeme silindi");
      fetchPayments();
      fetchInvoices();
    } catch (error) {
      toast.error("Ödeme silinemedi");
    }
  };

  const resetForm = () => {
    setFormData({ invoice_id: "", check_number: "", check_date: "", bank_name: "", amount: "", period_type: "Aylık" });
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`${API}/export/payments?format=${format}`, {
        ...getAuthHeaders(),
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileExtension = format === 'xlsx' ? 'xlsx' : format === 'docx' ? 'docx' : 'pdf';
      link.setAttribute('download', `odemeler_${new Date().toISOString().split('T')[0]}.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Ödemeler ${format.toUpperCase()} formatında indirildi`);
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

      await axios.post(`${API}/import/payments`, formData, {
        headers: {
          ...getAuthHeaders().headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success("Ödemeler başarıyla içe aktarıldı");
      setImportDialogOpen(false);
      setSelectedFile(null);
      fetchPayments();
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

  const filteredPayments = payments.filter(
    (payment) => {
      const matchesSearch = (payment.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.check_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.invoice_number || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPeriod = periodFilter === "all" || payment.period_type === periodFilter;
      return matchesSearch && matchesPeriod;
    }
  );

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="payments-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Ödemeler</h1>
          <p className="text-slate-600">Çek ödemelerini kaydedin ve takip edin</p>
        </div>
        <div className="flex gap-2">
          {/* Export Dropdown */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                <Download className="w-4 h-4 mr-2" />
                Dışa Aktar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" aria-describedby="export-dialog-description">
              <DialogHeader>
                <DialogTitle>Ödemeler Dışa Aktar</DialogTitle>
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
                <DialogTitle>Ödemeler İçe Aktar</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p id="import-dialog-description" className="text-sm text-slate-600">
                  Excel (.xlsx) dosyası yükleyin. Dosya aşağıdaki sütunları içermelidir:
                  invoice_id, invoice_number, customer_name, check_number, check_date, bank_name, amount
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
              <Button data-testid="add-payment-button" className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Ödeme Kaydet</Button>
            </DialogTrigger>
            <DialogContent data-testid="payment-dialog" aria-describedby="payment-dialog-description">
              <DialogHeader><DialogTitle>Çek Ödemesi Kaydet</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice">Fatura *</Label>
                  <Select value={formData.invoice_id} onValueChange={(value) => setFormData({ ...formData, invoice_id: value })} required>
                    <SelectTrigger data-testid="invoice-select"><SelectValue placeholder="Fatura seçin" /></SelectTrigger>
                    <SelectContent>
                      {invoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number} - {invoice.customer_name} (₺{(invoice.amount - (invoice.paid_amount || 0)).toFixed(2)} kalan)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check_number">Çek No *</Label>
                  <Input id="check_number" data-testid="check-number-input" value={formData.check_number} onChange={(e) => setFormData({ ...formData, check_number: e.target.value })} required />
                </div>
              <div className="space-y-2">
                <Label htmlFor="check_date">Çek Tarihi *</Label>
                <Input id="check_date" data-testid="check-date-input" type="date" value={formData.check_date} onChange={(e) => setFormData({ ...formData, check_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Banka *</Label>
                <Input id="bank_name" data-testid="bank-name-input" value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input id="amount" data-testid="payment-amount-input" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
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
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
                <Button type="submit" data-testid="save-payment-button" className="bg-blue-600 hover:bg-blue-700">Ödeme Kaydet</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input data-testid="search-payments-input" placeholder="Ödeme ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
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
            <tr><th>Fatura #</th><th>Müşteri</th><th>Çek No</th><th>Çek Tarihi</th><th>Banka</th><th>Tutar</th><th>Periyot</th><th>Ödeme Tarihi</th><th>Ekleyen</th><th>İşlemler</th></tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment.id} data-testid={`payment-row-${payment.id}`}>
                  <td className="font-semibold text-slate-900">{payment.invoice_number || "N/A"}</td>
                  <td className="text-slate-600">{payment.customer_name || "N/A"}</td>
                  <td className="text-slate-900 font-semibold">{payment.check_number}</td>
                  <td className="text-slate-600">{new Date(payment.check_date).toLocaleDateString()}</td>
                  <td className="text-slate-600">{payment.bank_name}</td>
                  <td className="text-green-600 font-bold">₺{payment.amount.toFixed(2)}</td>
                  <td className="text-slate-600">{payment.period_type || "Aylık"}</td>
                  <td className="text-slate-600">{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td className="text-slate-600 text-sm">{payment.created_by_username || "—"}</td>
                  <td>
                    <Button size="sm" variant="outline" data-testid={`delete-payment-${payment.id}`} className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(payment.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="10" className="text-center py-8 text-slate-500">Ödeme bulunamadı</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
