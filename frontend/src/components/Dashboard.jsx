import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { DollarSign, FileText, AlertCircle, CheckCircle, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState({ invoices: [], checks: [] });

  useEffect(() => {
    fetchStats();
    fetchCalendarData();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`, getAuthHeaders());
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    try {
      const [invoicesRes, checksRes] = await Promise.all([
        axios.get(`${API}/invoices`, getAuthHeaders()),
        axios.get(`${API}/checks`, getAuthHeaders())
      ]);
      setCalendarData({
        invoices: invoicesRes.data || [],
        checks: checksRes.data || []
      });
    } catch (error) {
      console.error("Failed to fetch calendar data", error);
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
    
    const days = [];
    
    // Empty cells before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 bg-slate-50"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = new Date().toDateString() === date.toDateString();
      
      // Find events for this date
      const dayInvoices = calendarData.invoices.filter(inv => inv.due_date === dateStr);
      const dayChecks = calendarData.checks.filter(check => check.due_date === dateStr);
      
      days.push(
        <div
          key={day}
          className={`h-20 border border-slate-200 p-1 overflow-hidden ${isToday ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-white'}`}
        >
          <div className={`text-xs font-semibold ${isToday ? 'text-blue-600' : 'text-slate-600'}`}>
            {day}
          </div>
          <div className="space-y-0.5 mt-1">
            {dayInvoices.length > 0 && (
              <div className="text-xs px-1 py-0.5 rounded bg-red-100 text-red-800 truncate">
                {dayInvoices.length} Fatura
              </div>
            )}
            {dayChecks.filter(c => c.check_type === 'received').length > 0 && (
              <div className="text-xs px-1 py-0.5 rounded bg-green-100 text-green-800 truncate">
                {dayChecks.filter(c => c.check_type === 'received').length} Alınan
              </div>
            )}
            {dayChecks.filter(c => c.check_type === 'issued').length > 0 && (
              <div className="text-xs px-1 py-0.5 rounded bg-orange-100 text-orange-800 truncate">
                {dayChecks.filter(c => c.check_type === 'issued').length} Verilen
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Tahsilat Takvimi</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
            <span>Fatura Vadesi</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
            <span>Alınan Çek</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-100 border border-orange-300"></div>
            <span>Verilen Çek</span>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-0 border border-slate-200">
          {dayNames.map(day => (
            <div key={day} className="bg-slate-100 text-center py-2 text-sm font-semibold text-slate-700 border border-slate-200">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Toplam Alacak",
      value: `₺${stats?.outstanding_amount?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "bg-red-500",
      testId: "total-outstanding",
    },
    {
      title: "Toplam Tahsilat",
      value: `₺${stats?.paid_amount?.toFixed(2) || "0.00"}`,
      icon: CheckCircle,
      color: "bg-green-500",
      testId: "total-collected",
    },
    {
      title: "Toplam Fatura",
      value: stats?.total_invoices || 0,
      icon: FileText,
      color: "bg-blue-500",
      testId: "total-invoices",
    },
    {
      title: "Ödenmemiş Faturalar",
      value: stats?.unpaid_count || 0,
      icon: AlertCircle,
      color: "bg-orange-500",
      testId: "unpaid-invoices",
    },
  ];

  const checkStats = [
    {
      title: "Alınan Çekler",
      total: stats?.total_received_checks || 0,
      amount: `₺${stats?.total_received_amount?.toFixed(2) || "0.00"}`,
      pending: stats?.pending_received_checks || 0,
      color: "bg-green-500",
    },
    {
      title: "Verilen Çekler",
      total: stats?.total_issued_checks || 0,
      amount: `₺${stats?.total_issued_amount?.toFixed(2) || "0.00"}`,
      pending: stats?.pending_issued_checks || 0,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in" data-testid="dashboard">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Kontrol Paneli</h1>
        <p className="text-slate-600">Faturalarınızın ve ödemelerinizin özeti</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              data-testid={card.testId}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 card-hover"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Check Statistics */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Çek Durumu</h2>
        <div className="grid grid-cols-2 gap-4">
          {checkStats.map((stat, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">{stat.title}</h3>
                <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.amount}</p>
              <p className="text-sm text-slate-600 mt-1">Toplam: {stat.total} adet</p>
              <p className="text-sm text-orange-600">Bekleyen: {stat.pending} adet</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Status */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Fatura Durumu</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{stats?.paid_count || 0}</p>
            <p className="text-sm text-green-600 mt-1">Ödendi</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-700">{stats?.partial_count || 0}</p>
            <p className="text-sm text-yellow-600 mt-1">Kısmi Ödeme</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-700">{stats?.unpaid_count || 0}</p>
            <p className="text-sm text-red-600 mt-1">Ödenmedi</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Son Ödemeler</h2>
        {stats?.recent_payments?.length > 0 ? (
          <div className="space-y-3">
            {stats.recent_payments.map((payment) => (
              <div
                key={payment.id}
                data-testid={`recent-payment-${payment.id}`}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-slate-900">{payment.customer_name || "Bilinmiyor"}</p>
                  <p className="text-sm text-slate-600">
                    Fatura #{payment.invoice_number} • Çek #{payment.check_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₺{payment.amount.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(payment.payment_date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">Henüz ödeme yok</p>
        )}
      </div>
    </div>
  );
}
