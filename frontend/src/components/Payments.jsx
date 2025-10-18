import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Search } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ invoice_id: "", check_number: "", check_date: "", bank_name: "", amount: "" });

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API}/payments`, getAuthHeaders());
      setPayments(response.data);
    } catch (error) {
      toast.error("Failed to load payments");
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
      toast.error("Failed to load invoices");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      await axios.post(`${API}/payments`, payload, getAuthHeaders());
      toast.success("Payment recorded successfully");
      setDialogOpen(false);
      resetForm();
      fetchPayments();
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to record payment");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    try {
      await axios.delete(`${API}/payments/${id}`, getAuthHeaders());
      toast.success("Payment deleted successfully");
      fetchPayments();
      fetchInvoices();
    } catch (error) {
      toast.error("Failed to delete payment");
    }
  };

  const resetForm = () => {
    setFormData({ invoice_id: "", check_number: "", check_date: "", bank_name: "", amount: "" });
  };

  const filteredPayments = payments.filter(
    (payment) =>
      (payment.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.check_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.invoice_number || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="payments-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Payments</h1>
          <p className="text-slate-600">Record and track check payments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="add-payment-button" className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Record Payment</Button>
          </DialogTrigger>
          <DialogContent data-testid="payment-dialog" aria-describedby="payment-dialog-description">
            <DialogHeader><DialogTitle>Record Check Payment</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice">Invoice *</Label>
                <Select value={formData.invoice_id} onValueChange={(value) => setFormData({ ...formData, invoice_id: value })} required>
                  <SelectTrigger data-testid="invoice-select"><SelectValue placeholder="Select invoice" /></SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number} - {invoice.customer_name} (₺{(invoice.amount - (invoice.paid_amount || 0)).toFixed(2)} remaining)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_number">Check Number *</Label>
                <Input id="check_number" data-testid="check-number-input" value={formData.check_number} onChange={(e) => setFormData({ ...formData, check_number: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_date">Check Date *</Label>
                <Input id="check_date" data-testid="check-date-input" type="date" value={formData.check_date} onChange={(e) => setFormData({ ...formData, check_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name *</Label>
                <Input id="bank_name" data-testid="bank-name-input" value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input id="amount" data-testid="payment-amount-input" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" data-testid="save-payment-button" className="bg-blue-600 hover:bg-blue-700">Record Payment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input data-testid="search-payments-input" placeholder="Search payments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="custom-table">
          <thead>
            <tr><th>Invoice #</th><th>Customer</th><th>Check Number</th><th>Check Date</th><th>Bank</th><th>Amount</th><th>Payment Date</th><th>Actions</th></tr>
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
                  <td className="text-green-600 font-bold">${payment.amount.toFixed(2)}</td>
                  <td className="text-slate-600">{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td>
                    <Button size="sm" variant="outline" data-testid={`delete-payment-${payment.id}`} className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(payment.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="8" className="text-center py-8 text-slate-500">No payments found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
