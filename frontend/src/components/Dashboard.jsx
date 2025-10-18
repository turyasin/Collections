import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { DollarSign, FileText, AlertCircle, CheckCircle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Outstanding",
      value: `$${stats?.outstanding_amount?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "bg-red-500",
      testId: "total-outstanding",
    },
    {
      title: "Total Collected",
      value: `$${stats?.paid_amount?.toFixed(2) || "0.00"}`,
      icon: CheckCircle,
      color: "bg-green-500",
      testId: "total-collected",
    },
    {
      title: "Total Invoices",
      value: stats?.total_invoices || 0,
      icon: FileText,
      color: "bg-blue-500",
      testId: "total-invoices",
    },
    {
      title: "Unpaid Invoices",
      value: stats?.unpaid_count || 0,
      icon: AlertCircle,
      color: "bg-orange-500",
      testId: "unpaid-invoices",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in" data-testid="dashboard">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of your invoices and payments</p>
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

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Invoice Status</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{stats?.paid_count || 0}</p>
            <p className="text-sm text-green-600 mt-1">Paid</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-700">{stats?.partial_count || 0}</p>
            <p className="text-sm text-yellow-600 mt-1">Partial</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-700">{stats?.unpaid_count || 0}</p>
            <p className="text-sm text-red-600 mt-1">Unpaid</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Payments</h2>
        {stats?.recent_payments?.length > 0 ? (
          <div className="space-y-3">
            {stats.recent_payments.map((payment) => (
              <div
                key={payment.id}
                data-testid={`recent-payment-${payment.id}`}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-slate-900">{payment.customer_name || "N/A"}</p>
                  <p className="text-sm text-slate-600">
                    Invoice #{payment.invoice_number} • Check #{payment.check_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${payment.amount.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">No payments yet</p>
        )}
      </div>
    </div>
  );
}
