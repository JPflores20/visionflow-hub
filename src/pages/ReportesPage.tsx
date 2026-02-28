import { useMemo, useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

type Period = "day" | "week" | "month";

export default function ReportesPage() {
  const { sales } = useStore();
  const [period, setPeriod] = useState<Period>("week");

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter(s => {
      const d = new Date(s.date);
      if (period === "day") return s.date === todayStr;
      if (period === "week") { const diff = (now.getTime() - d.getTime()) / 86400000; return diff <= 7; }
      return s.date.slice(0, 7) === todayStr.slice(0, 7);
    });
  }, [sales, period, todayStr]);

  const grossRevenue = filteredSales.reduce((s, x) => s + x.total, 0);
  const totalCost = filteredSales.reduce((s, x) => s + x.items.reduce((c, i) => c + i.costPrice * i.quantity, 0), 0);
  const totalDiscount = filteredSales.reduce((s, x) => s + x.discount, 0);
  const netProfit = filteredSales.reduce((s, x) => s + x.profit, 0);
  const margin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : "0";

  const chartData = useMemo(() => {
    const map = new Map<string, { revenue: number; profit: number }>();
    filteredSales.forEach(s => {
      const existing = map.get(s.date) || { revenue: 0, profit: 0 };
      map.set(s.date, { revenue: existing.revenue + s.total, profit: existing.profit + s.profit });
    });
    return Array.from(map.entries()).sort().map(([date, data]) => ({ date, ...data }));
  }, [filteredSales]);

  const kpis = [
    { title: "Ingresos Brutos", value: `$${grossRevenue.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { title: "Costos", value: `$${totalCost.toLocaleString()}`, icon: TrendingDown, color: "text-destructive" },
    { title: "Ganancia Neta", value: `$${netProfit.toLocaleString()}`, icon: TrendingUp, color: "text-success" },
    { title: "Margen", value: `${margin}%`, icon: BarChart3, color: "text-accent" },
  ];

  const periodLabel: Record<Period, string> = { day: "Hoy", week: "Última Semana", month: "Este Mes" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Reportes y Finanzas</h1>
        <div className="flex items-center gap-2">
          <Label>Período:</Label>
          <Select value={period} onValueChange={v => setPeriod(v as Period)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hoy</SelectItem>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(k => (
          <Card key={k.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{k.title}</CardTitle>
              <k.icon className={`h-5 w-5 ${k.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Ingresos — {periodLabel[period]}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                  <Bar dataKey="revenue" name="Ingresos" fill="hsl(213, 72%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Ganancia — {periodLabel[period]}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                  <Line type="monotone" dataKey="profit" name="Ganancia" stroke="hsl(152, 60%, 40%)" strokeWidth={2} dot={{ fill: "hsl(152, 60%, 40%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Detalle de Ventas — {periodLabel[period]}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Descuento</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ganancia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Sin ventas en este período</TableCell></TableRow>
              ) : filteredSales.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.date}</TableCell>
                  <TableCell>{s.clientName}</TableCell>
                  <TableCell className="text-right">${s.subtotal.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${s.discount.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">${s.total.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-success font-semibold">${s.profit.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Resumen Financiero</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Ingresos Brutos:</span><span className="font-semibold">${grossRevenue.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Descuentos Otorgados:</span><span className="font-semibold">-${totalDiscount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Costo de Productos:</span><span className="font-semibold">-${totalCost.toLocaleString()}</span></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-t pt-2"><span className="font-semibold">Ganancia Neta:</span><span className="font-bold text-success">${netProfit.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Margen de Ganancia:</span><span className="font-semibold">{margin}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Número de Ventas:</span><span className="font-semibold">{filteredSales.length}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
