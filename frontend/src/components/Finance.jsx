import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, CreditCard, Receipt } from "lucide-react";
import Invoices from "@/components/Invoices";
import Payments from "@/components/Payments";
import Checks from "@/components/Checks";

export default function Finance() {
  const [activeTab, setActiveTab] = useState("invoices");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 mt-2">Finans</h1>
          <p className="text-slate-600">Faturalar, ödemeler ve çekleri yönetin</p>
        </div>
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
