import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Download, Upload, FileText, Receipt, CreditCard, CalendarDays, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export default function ImportExport() {
  const [exportType, setExportType] = useState("");
  const [exportFormat, setExportFormat] = useState("xlsx");
  const [importType, setImportType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const exportOptions = [
    { value: "invoices", label: "Faturalar", icon: FileText, description: "Tüm faturaları dışa aktar" },
    { value: "checks", label: "Çekler", icon: Receipt, description: "Tüm çekleri dışa aktar" },
    { value: "payments", label: "Ödemeler", icon: CreditCard, description: "Tüm ödemeleri dışa aktar" },
    { value: "weekly-schedule", label: "Haftalık Plan", icon: CalendarDays, description: "Haftalık ödeme programını dışa aktar" },
    { value: "dashboard-stats", label: "Dashboard Özeti", icon: BarChart3, description: "İstatistik özetini dışa aktar" },
  ];

  const importOptions = [
    { value: "invoices", label: "Faturalar", icon: FileText, description: "Faturaları içe aktar (.xlsx)" },
    { value: "checks", label: "Çekler", icon: Receipt, description: "Çekleri içe aktar (.xlsx)" },
    { value: "payments", label: "Ödemeler", icon: CreditCard, description: "Ödemeleri içe aktar (.xlsx)" },
  ];

  const handleExport = async () => {
    if (!exportType) {
      toast.error("Lütfen dışa aktarılacak veri tipini seçin");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API}/export/${exportType}?format=${exportFormat}`, {
        ...getAuthHeaders(),
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileExtension = exportFormat;
      const fileName = `${exportType}_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${exportType} başarıyla ${exportFormat.toUpperCase()} formatında indirildi`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Dışa aktarma başarısız oldu");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        toast.error("Sadece .xlsx dosyaları desteklenmektedir");
        e.target.value = null;
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!importType) {
      toast.error("Lütfen içe aktarılacak veri tipini seçin");
      return;
    }

    if (!selectedFile) {
      toast.error("Lütfen bir dosya seçin");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(`${API}/import/${importType}`, formData, {
        headers: {
          ...getAuthHeaders().headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(response.data.message || "İçe aktarma başarılı");
      setSelectedFile(null);
      setImportType("");
      // Reset file input
      document.querySelector('input[type="file"]').value = null;
    } catch (error) {
      toast.error(error.response?.data?.detail || "İçe aktarma başarısız oldu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">İçe/Dışa Aktarım</h1>
        <p className="text-slate-600">Verilerinizi dışa aktarın veya içe aktarın</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-green-600" />
              Dışa Aktarma
            </CardTitle>
            <CardDescription>Verilerinizi farklı formatlarda dışa aktarın</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Veri Tipi</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Dışa aktarılacak veri tipini seçin" />
                </SelectTrigger>
                <SelectContent>
                  {exportOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-slate-500">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dosya Formatı</Label>
              <div className="flex gap-2">
                <Button
                  variant={exportFormat === "xlsx" ? "default" : "outline"}
                  className={exportFormat === "xlsx" ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => setExportFormat("xlsx")}
                >
                  Excel (.xlsx)
                </Button>
                <Button
                  variant={exportFormat === "docx" ? "default" : "outline"}
                  className={exportFormat === "docx" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  onClick={() => setExportFormat("docx")}
                >
                  Word (.docx)
                </Button>
                <Button
                  variant={exportFormat === "pdf" ? "default" : "outline"}
                  className={exportFormat === "pdf" ? "bg-red-600 hover:bg-red-700" : ""}
                  onClick={() => setExportFormat("pdf")}
                >
                  PDF (.pdf)
                </Button>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={!exportType || loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? "İndiriliyor..." : "Dışa Aktar"}
            </Button>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-600" />
              İçe Aktarma
            </CardTitle>
            <CardDescription>Excel dosyalarından veri yükleyin (.xlsx)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Veri Tipi</Label>
              <Select value={importType} onValueChange={setImportType}>
                <SelectTrigger>
                  <SelectValue placeholder="İçe aktarılacak veri tipini seçin" />
                </SelectTrigger>
                <SelectContent>
                  {importOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-slate-500">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dosya Seçin</Label>
              <Input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                disabled={!importType}
              />
              {selectedFile && (
                <p className="text-sm text-green-600">Seçili dosya: {selectedFile.name}</p>
              )}
            </div>

            {importType && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-medium mb-1">Gerekli Sütunlar:</p>
                <p className="text-xs text-blue-700">
                  {importType === "invoices" && "customer_id, customer_name, invoice_number, amount, paid_amount, due_date, status, notes"}
                  {importType === "checks" && "check_type, check_number, amount, due_date, bank_name, payer_payee, status, notes"}
                  {importType === "payments" && "invoice_id, invoice_number, customer_name, check_number, check_date, bank_name, amount"}
                </p>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!importType || !selectedFile || loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              {loading ? "Yükleniyor..." : "İçe Aktar"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg">Kullanım Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p><strong>Dışa Aktarma:</strong> Verilerinizi Excel, Word veya PDF formatında indirebilirsiniz.</p>
          <p><strong>İçe Aktarma:</strong> Sadece Excel (.xlsx) dosyaları desteklenmektedir. Dosyanızın gerekli sütunları içerdiğinden emin olun.</p>
          <p><strong>İpucu:</strong> Önce bir dışa aktarma yaparak şablon dosyayı indirebilir, doldurup tekrar içe aktarabilirsiniz.</p>
        </CardContent>
      </Card>
    </div>
  );
}
