import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Archive as ArchiveIcon, RefreshCw, FileText, CreditCard, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_BACKEND_URL;

export default function Archive() {
  const [loading, setLoading] = useState(true);
  const [archivedInvoices, setArchivedInvoices] = useState([]);
  const [archivedPayments, setArchivedPayments] = useState([]);
  const [archivedChecks, setArchivedChecks] = useState([]);
  const [activeTab, setActiveTab] = useState("invoices");

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  useEffect(() => {
    fetchArchivedData();
  }, []);

  const fetchArchivedData = async () => {
    setLoading(true);
    try {
      const [invoicesRes, paymentsRes, checksRes] = await Promise.all([
        axios.get(`${API}/archive/invoices`, getAuthHeaders()),
        axios.get(`${API}/archive/payments`, getAuthHeaders()),
        axios.get(`${API}/archive/checks`, getAuthHeaders())
      ]);
      
      setArchivedInvoices(invoicesRes.data || []);
      setArchivedPayments(paymentsRes.data || []);
      setArchivedChecks(checksRes.data || []);
    } catch (error) {
      toast.error("Arşiv verisi yüklenemedi");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (type, id) => {
    try {
      await axios.post(`${API}/archive/restore/${type}/${id}`, {}, getAuthHeaders());
      toast.success(`${type === 'invoice' ? 'Fatura' : type === 'payment' ? 'Ödeme' : 'Çek'} geri getirildi`);
      fetchArchivedData();
    } catch (error) {
      toast.error("Geri getirme başarısız");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ArchiveIcon className="w-8 h-8 text-slate-600" />
          <h1 className="text-3xl font-bold text-slate-900">Arşiv</h1>
        </div>
        <div className="text-sm text-slate-600">
          3 ay ve üzeri eski, tamamlanmış kayıtlar
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Faturalar ({archivedInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Ödemeler ({archivedPayments.length})
          </TabsTrigger>
          <TabsTrigger value="checks" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Çekler ({archivedChecks.length})
          </TabsTrigger>
        </TabsList>

        {/* Archived Invoices */}
        <TabsContent value="invoices" className="mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Fatura #</th>
                  <th>Müşteri</th>
                  <th>Tutar</th>
                  <th>Para Birimi</th>
                  <th>Vade</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {archivedInvoices.length > 0 ? (
                  archivedInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="font-semibold text-slate-900">{invoice.invoice_number}</td>
                      <td className="text-slate-600">{invoice.customer_name || "N/A"}</td>
                      <td className="text-slate-900 font-semibold">{invoice.amount.toFixed(2)}</td>
                      <td className="text-slate-600">{invoice.currency || "TRY"}</td>
                      <td className="text-slate-600">{new Date(invoice.due_date).toLocaleDateString()}</td>
                      <td><span className="status-badge status-paid">Ödendi</span></td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore('invoice', invoice.id)}
                          className="flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Geri Al
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-500">Arşivlenmiş fatura bulunamadı</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Archived Payments */}
        <TabsContent value="payments" className="mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Fatura #</th>
                  <th>Müşteri</th>
                  <th>Ödeme Yöntemi</th>
                  <th>Tutar</th>
                  <th>Para Birimi</th>
                  <th>Ödeme Tarihi</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {archivedPayments.length > 0 ? (
                  archivedPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="font-semibold text-slate-900">{payment.invoice_number || "N/A"}</td>
                      <td className="text-slate-600">{payment.customer_name || "N/A"}</td>
                      <td className="text-slate-900">{payment.payment_method || "Çek"}</td>
                      <td className="text-green-600 font-bold">{payment.amount.toFixed(2)}</td>
                      <td className="text-slate-600">{payment.currency || "TRY"}</td>
                      <td className="text-slate-600">{new Date(payment.payment_date).toLocaleDateString()}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore('payment', payment.id)}
                          className="flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Geri Al
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-500">Arşivlenmiş ödeme bulunamadı</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Archived Checks */}
        <TabsContent value="checks" className="mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Çek No</th>
                  <th>Alacaklı/Borçlu</th>
                  <th>Banka</th>
                  <th>Tutar</th>
                  <th>Vade</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {archivedChecks.length > 0 ? (
                  archivedChecks.map((check) => (
                    <tr key={check.id}>
                      <td className="font-semibold text-slate-900">{check.check_number}</td>
                      <td className="text-slate-600">{check.payer_payee}</td>
                      <td className="text-slate-600">{check.bank_name}</td>
                      <td className="text-slate-900 font-bold">₺{check.amount.toFixed(2)}</td>
                      <td className="text-slate-600">{new Date(check.due_date).toLocaleDateString()}</td>
                      <td><span className="status-badge status-paid">{check.status === 'collected' ? 'Tahsil Edildi' : 'Ödendi'}</span></td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore('check', check.id)}
                          className="flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Geri Al
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-500">Arşivlenmiş çek bulunamadı</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
