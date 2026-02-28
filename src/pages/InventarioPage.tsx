import { useState } from "react";
import { useStore, Product } from "@/context/StoreContext";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Package, Glasses, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const typeLabels: Record<string, string> = {
  frame: "Armazón", "single-vision": "Monofocal", bifocal: "Bifocal", progressive: "Progresivo", contact: "Contacto",
};

const emptyProduct = (category: "frames" | "lenses"): Omit<Product, "id"> => ({
  sku: "", brand: "", model: "", type: category === "frames" ? "frame" : "single-vision",
  category, costPrice: 0, sellingPrice: 0, stock: 0,
});

export default function InventarioPage() {
  const { products, addProduct, updateStock } = useStore();
  const { toast } = useToast();
  const [tab, setTab] = useState("frames");
  const [modalOpen, setModalOpen] = useState(false);
  const [stockModal, setStockModal] = useState<{ product: Product; delta: string } | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(emptyProduct("frames"));

  const filtered = products.filter(p => p.category === tab);

  const openAdd = () => { setForm(emptyProduct(tab as "frames" | "lenses")); setModalOpen(true); };

  const handleSave = () => {
    if (!form.sku.trim() || !form.brand.trim() || !form.model.trim()) {
      toast({ title: "Error", description: "SKU, marca y modelo son obligatorios.", variant: "destructive" });
      return;
    }
    addProduct(form);
    setModalOpen(false);
    toast({ title: "Producto agregado" });
  };

  const handleStockUpdate = () => {
    if (!stockModal) return;
    const delta = parseInt(stockModal.delta);
    if (isNaN(delta)) {
      toast({ title: "Error", description: "Ingresa una cantidad válida.", variant: "destructive" });
      return;
    }
    updateStock(stockModal.product.id, delta);
    setStockModal(null);
    toast({ title: "Stock actualizado" });
  };

  const setField = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Nuevo Producto</Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="frames"><Glasses className="h-4 w-4 mr-1" /> Armazones</TabsTrigger>
          <TabsTrigger value="lenses"><Package className="h-4 w-4 mr-1" /> Micas / Contactos</TabsTrigger>
        </TabsList>

        {["frames", "lenses"].map(t => (
          <TabsContent key={t} value={t}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead className="hidden md:table-cell">Modelo</TableHead>
                      <TableHead className="hidden md:table-cell">Tipo</TableHead>
                      <TableHead className="text-right">Costo</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                        <TableCell className="font-medium">{p.brand}</TableCell>
                        <TableCell className="hidden md:table-cell">{p.model}</TableCell>
                        <TableCell className="hidden md:table-cell">{typeLabels[p.type]}</TableCell>
                        <TableCell className="text-right">${p.costPrice.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${p.sellingPrice.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={p.stock < 5 ? "destructive" : "secondary"}>
                            {p.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setStockModal({ product: p, delta: "" })}>
                            <ArrowUpDown className="h-4 w-4 mr-1" /> Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Product Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo Producto</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>SKU *</Label><Input value={form.sku} onChange={e => setField("sku", e.target.value)} /></div>
              <div><Label>Marca *</Label><Input value={form.brand} onChange={e => setField("brand", e.target.value)} /></div>
              <div><Label>Modelo *</Label><Input value={form.model} onChange={e => setField("model", e.target.value)} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setField("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tab === "frames" ? (
                      <SelectItem value="frame">Armazón</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="single-vision">Monofocal</SelectItem>
                        <SelectItem value="bifocal">Bifocal</SelectItem>
                        <SelectItem value="progressive">Progresivo</SelectItem>
                        <SelectItem value="contact">Contacto</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Stock Inicial</Label><Input type="number" value={form.stock} onChange={e => setField("stock", Number(e.target.value))} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Precio Costo</Label><Input type="number" value={form.costPrice} onChange={e => setField("costPrice", Number(e.target.value))} /></div>
              <div><Label>Precio Venta</Label><Input type="number" value={form.sellingPrice} onChange={e => setField("sellingPrice", Number(e.target.value))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Modal */}
      <Dialog open={!!stockModal} onOpenChange={() => setStockModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Ajustar Stock</DialogTitle></DialogHeader>
          {stockModal && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {stockModal.product.brand} {stockModal.product.model} — Stock actual: <strong>{stockModal.product.stock}</strong>
              </p>
              <div>
                <Label>Cantidad (positiva = entrada, negativa = salida)</Label>
                <Input type="number" value={stockModal.delta} onChange={e => setStockModal({ ...stockModal, delta: e.target.value })} placeholder="ej: +10 o -3" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockModal(null)}>Cancelar</Button>
            <Button onClick={handleStockUpdate}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
