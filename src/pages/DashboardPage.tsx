import { useMemo } from "react";
import { useStore } from "@/context/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, ShoppingCart, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { sales, products } = useStore();
  const today = new Date().toISOString().slice(0, 10);

  const todayEarnings = useMemo(() =>
    sales.filter(s => s.date === today).reduce((sum, s) => sum + s.total, 0), [sales, today]);

  const monthEarnings = useMemo(() => {
    const month = today.slice(0, 7);
    return sales.filter(s => s.date.startsWith(month)).reduce((sum, s) => sum + s.total, 0);
  }, [sales, today]);

  const lowStockCount = useMemo(() => products.filter(p => p.stock < 5).length, [products]);

  const chartData = useMemo(() => {
    const days: { name: string; ventas: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString("es-MX", { weekday: "short" });
      const total = sales.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.total, 0);
      days.push({ name: dayName, ventas: total });
    }
    return days;
  }, [sales]);

  const recentSales = useMemo(() =>
    [...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5), [sales]);

  const kpis = [
    { title: "Ventas Hoy", value: `$${todayEarnings.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { title: "Ventas del Mes", value: `$${monthEarnings.toLocaleString()}`, icon: TrendingUp, color: "text-accent" },
    { title: "Total Ventas", value: sales.length.toString(), icon: ShoppingCart, color: "text-success" },
    { title: "Inventario Bajo", value: lowStockCount.toString(), icon: AlertTriangle, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ventas — Últimos 7 Días</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Ventas"]} />
                <Bar dataKey="ventas" fill="hsl(213, 72%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimas 5 Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSales.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.date}</TableCell>
                  <TableCell>{s.clientName}</TableCell>
                  <TableCell>
                    {s.items.map(i => i.productName).join(", ")}
                  </TableCell>
                  <TableCell className="text-right font-semibold">${s.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
