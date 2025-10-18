import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Building2, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_BACKEND_URL;

export default function CompanyInfo() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    tax_number: "",
    tax_office: "",
    address: "",
    phone: "",
    email: "",
    bank_accounts: []
  });

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  useEffect(() => {
    checkAdminStatus();
    fetchCompanyInfo();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const res = await axios.get(`${API}/users/me`, getAuthHeaders());
      setIsAdmin(res.data.is_admin || false);
      if (!res.data.is_admin) {
        toast.error("Bu sayfaya erişim yetkiniz yok");
      }
    } catch (error) {
      console.error("Failed to check admin status", error);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const res = await axios.get(`${API}/company-info`, getAuthHeaders());
      if (res.data) {
        setFormData(res.data);
        // Ensure at least 5 bank account slots
        if (res.data.bank_accounts.length < 5) {
          const emptySlots = 5 - res.data.bank_accounts.length;
          const newAccounts = [...res.data.bank_accounts];
          for (let i = 0; i < emptySlots; i++) {
            newAccounts.push({
              id: `temp_${Date.now()}_${i}`,
              bank_name: "",
              branch: "",
              iban: "",
              account_holder: "",
              currency: "TRY"
            });
          }
          setFormData({ ...res.data, bank_accounts: newAccounts });
        }
      }
    } catch (error) {
      console.error("Failed to fetch company info", error);
      // Initialize with 5 empty bank accounts
      const emptyAccounts = [];
      for (let i = 0; i < 5; i++) {
        emptyAccounts.push({
          id: `temp_${Date.now()}_${i}`,
          bank_name: "",
          branch: "",
          iban: "",
          account_holder: "",
          currency: "TRY"
        });
      }
      setFormData(prev => ({ ...prev, bank_accounts: emptyAccounts }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Filter out empty bank accounts
      const filledBankAccounts = formData.bank_accounts.filter(
        acc => acc.bank_name && acc.iban && acc.account_holder
      );

      await axios.post(`${API}/company-info`, {
        ...formData,
        bank_accounts: filledBankAccounts
      }, getAuthHeaders());

      toast.success("Firma bilgileri kaydedildi");
      fetchCompanyInfo();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Kaydetme başarısız");
    } finally {
      setSaving(false);
    }
  };

  const addBankAccount = () => {
    setFormData({
      ...formData,
      bank_accounts: [
        ...formData.bank_accounts,
        {
          id: `temp_${Date.now()}`,
          bank_name: "",
          branch: "",
          iban: "",
          account_holder: "",
          currency: "TRY"
        }
      ]
    });
  };

  const removeBankAccount = (index) => {
    const newAccounts = formData.bank_accounts.filter((_, i) => i !== index);
    setFormData({ ...formData, bank_accounts: newAccounts });
  };

  const updateBankAccount = (index, field, value) => {
    const newAccounts = [...formData.bank_accounts];
    newAccounts[index] = { ...newAccounts[index], [field]: value };
    setFormData({ ...formData, bank_accounts: newAccounts });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Firma Bilgileri</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Cari Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Firma Adı *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_number">Vergi No</Label>
              <Input
                id="tax_number"
                value={formData.tax_number}
                onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_office">Vergi Dairesi</Label>
              <Input
                id="tax_office"
                value={formData.tax_office}
                onChange={(e) => setFormData({ ...formData, tax_office: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Banka Hesapları</h2>
            <Button type="button" onClick={addBankAccount} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Hesap Ekle
            </Button>
          </div>

          <div className="space-y-4">
            {formData.bank_accounts.map((account, index) => (
              <div key={account.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-700">Hesap {index + 1}</h3>
                  {formData.bank_accounts.length > 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeBankAccount(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Banka Adı</Label>
                    <Input
                      value={account.bank_name}
                      onChange={(e) => updateBankAccount(index, "bank_name", e.target.value)}
                      placeholder="Örn: Ziraat Bankası"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Şube</Label>
                    <Input
                      value={account.branch}
                      onChange={(e) => updateBankAccount(index, "branch", e.target.value)}
                      placeholder="Örn: Kadıköy Şubesi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Para Birimi</Label>
                    <Select
                      value={account.currency}
                      onValueChange={(value) => updateBankAccount(index, "currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRY">TRY (₺)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>IBAN</Label>
                    <Input
                      value={account.iban}
                      onChange={(e) => updateBankAccount(index, "iban", e.target.value)}
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hesap Sahibi</Label>
                    <Input
                      value={account.account_holder}
                      onChange={(e) => updateBankAccount(index, "account_holder", e.target.value)}
                      placeholder="Firma Adı"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    </div>
  );
}
