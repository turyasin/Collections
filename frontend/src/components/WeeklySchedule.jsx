import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Calendar, TrendingDown, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export default function WeeklySchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`${API}/payments/weekly-schedule?weeks=4`, getAuthHeaders());
      setSchedule(response.data);
    } catch (error) {
      toast.error("Haftalık program yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="weekly-schedule-page">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Haftalık Ödeme Programı</h1>
        <p className="text-slate-600">Önümüzdeki 4 hafta için ödeme ve tahsilat takvimi</p>
      </div>

      <div className="space-y-4">
        {schedule.map((week, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" data-testid={`week-${idx}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{week.week_label}</h3>
                  <p className="text-sm text-slate-600">{week.date_range}</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-sm text-slate-600 flex items-center gap-1"><TrendingUp className="w-4 h-4 text-green-600" />Tahsilat</p>
                  <p className="text-2xl font-bold text-green-600">₺{week.total_receivable.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 flex items-center gap-1"><TrendingDown className="w-4 h-4 text-red-600" />Ödeme</p>
                  <p className="text-2xl font-bold text-red-600">₺{week.total_payable.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {week.received_checks.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Alınacak Çekler ({week.received_checks.length})</h4>
                  <div className="space-y-2">
                    {week.received_checks.map(check => (
                      <div key={check.id} className="text-sm">
                        <p className="font-medium text-slate-900">{check.check_number}</p>
                        <p className="text-slate-600">{check.payer_payee} - ₺{check.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {week.issued_checks.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">Ödenecek Çekler ({week.issued_checks.length})</h4>
                  <div className="space-y-2">
                    {week.issued_checks.map(check => (
                      <div key={check.id} className="text-sm">
                        <p className="font-medium text-slate-900">{check.check_number}</p>
                        <p className="text-slate-600">{check.payer_payee} - ₺{check.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {week.invoices_due.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Vadesi Gelen Faturalar ({week.invoices_due.length})</h4>
                  <div className="space-y-2">
                    {week.invoices_due.map(invoice => (
                      <div key={invoice.id} className="text-sm">
                        <p className="font-medium text-slate-900">{invoice.invoice_number}</p>
                        <p className="text-slate-600">{invoice.customer_name} - ₺{(invoice.amount - (invoice.paid_amount || 0)).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {week.received_checks.length === 0 && week.issued_checks.length === 0 && week.invoices_due.length === 0 && (
              <p className="text-center text-slate-500 py-4">Bu hafta için ödeme/tahsilat bulunmamaktadır</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
