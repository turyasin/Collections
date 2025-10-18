import { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, Receipt, Archive } from "lucide-react";
import { toast } from "sonner";
import Invoices from "@/components/Invoices";
import Payments from "@/components/Payments";
import Checks from "@/components/Checks";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export default function Finance() {
  const [activeTab, setActiveTab] = useState("invoices");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/users/me`, getAuthHeaders());
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Failed to fetch current user");
    }
  };

  const handleArchive = async () => {
    if (!window.confirm(`Eski kayıtları arşivlemek istediğinizden emin misiniz?`)) return;
    
    try {
      await axios.post(`${API}/archive/create`, {}, getAuthHeaders());
      toast.success("Arşivleme işlemi tamamlandı");
      window.location.reload();
    } catch (error) {
      toast.error("Arşivleme başarısız");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 mt-2">Finans</h1>
          <p className="text-slate-600">Faturalar, ödemeler ve çekleri yönetin</p>
        </div>
        {currentUser?.is_admin && (
          <Button
            onClick={handleArchive}
            variant="outline"
            className="flex items-center gap-2 border-slate-300 hover:bg-slate-50"
          >
            <Archive className="w-4 h-4" />
            Arşivle
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Faturalar
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Ödemeler
          </TabsTrigger>
          <TabsTrigger value="checks" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Çekler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-6">
          <Invoices />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <Payments />
        </TabsContent>

        <TabsContent value="checks" className="mt-6">
          <Checks />
        </TabsContent>
      </Tabs>
    </div>
  );
}
