import { useState, useMemo } from "react";
import { useStore, Client, SaleItem } from "@/context/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Trash2, ShoppingCart, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function POSPage() {
  const { clients, products, addClient, addSale } = useStore();
  const { toast } = useToast();

  const [selectedClientId, setSelectedClientId] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [productSearch, setProductSearch] = useState("");
  const [newClientModal, setNewClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  const availableProducts = useMemo(() =>
    products.filter(p => p.stock > 0 && (
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.model.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
    )), [products, productSearch]);

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);
  const totalCost = cart.reduce((s, i) => s + i.costPrice * i.quantity, 0);

  const addToCart = (p: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === p.id);
      if (existing) {
        return prev.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: p.id, productName: `${p.brand} ${p.model}`, quantity: 1, unitPrice: p.sellingPrice, costPrice: p.costPrice }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const handleQuickClient = () => {
    if (!newClientName.trim() || !newClientPhone.trim()) {
      toast({ title: "Error", description: "Nombre y teléfono requeridos.", variant: "destructive" });
      return;
    }
    const c = addClient({
      fullName: newClientName, phone: newClientPhone, email: "",
      lastExamDate: "", examInStore: false,
      prescription: { odSphere: "", odCylinder: "", odAxis: "", odAddition: "", oiSphere: "", oiCylinder: "", oiAxis: "", oiAddition: "" },
      notes: "", lastPurchaseDate: "",
    });
    setSelectedClientId(c.id);
    setNewClientModal(false);
    setNewClientName(""); setNewClientPhone("");
    toast({ title: "Cliente creado" });
  };

  const handleConfirmSale = () => {
    if (!selectedClientId) {
      toast({ title: "Error", description: "Selecciona un cliente.", variant: "destructive" });
      return;
    }
    if (cart.length === 0) {
      toast({ title: "Error", description: "Agrega productos al carrito.", variant: "destructive" });
      return;
    }
    const client = clients.find(c => c.id === selectedClientId)!;
    addSale({
      clientId: selectedClientId, clientName: client.fullName,
      items: cart, subtotal, discount, total,
      profit: total - totalCost,
      date: new Date().toISOString().slice(0, 10),
    });
    setCart([]); setDiscount(0); setSelectedClientId(""); setProductSearch("");
    toast({ title: "¡Venta registrada!", description: `Total: $${total.toLocaleString()}` });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Punto de Venta</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Product selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Client selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label>Cliente</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar cliente..." /></SelectTrigger>
                    <SelectContent>
                      {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => setNewClientModal(true)}>
                  <UserPlus className="h-4 w-4 mr-1" /> Nuevo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Product search */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Buscar Productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por marca, modelo o SKU..." className="pl-9" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
              </div>
              {productSearch && (
                <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
                  {availableProducts.slice(0, 8).map(p => (
                    <button key={p.id} className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 text-sm text-left" onClick={() => { addToCart(p); setProductSearch(""); }}>
                      <span>{p.brand} {p.model} <span className="text-muted-foreground">({p.sku})</span></span>
                      <span className="font-semibold">${p.sellingPrice.toLocaleString()}</span>
                    </button>
                  ))}
                  {availableProducts.length === 0 && <p className="text-center text-sm text-muted-foreground py-3">Sin resultados</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cart table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Carrito</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cant.</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map(i => (
                    <TableRow key={i.productId}>
                      <TableCell>{i.productName}</TableCell>
                      <TableCell className="text-center">
                        <Input type="number" min={1} className="w-16 text-center mx-auto" value={i.quantity}
                          onChange={e => setCart(prev => prev.map(x => x.productId === i.productId ? { ...x, quantity: Math.max(1, Number(e.target.value)) } : x))} />
                      </TableCell>
                      <TableCell className="text-right">${i.unitPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold">${(i.unitPrice * i.quantity).toLocaleString()}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => removeFromCart(i.productId)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                  {cart.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Carrito vacío</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Resumen de Venta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-semibold">${subtotal.toLocaleString()}</span></div>
              <div className="flex items-center gap-2">
                <Label className="text-sm shrink-0">Descuento $</Label>
                <Input type="number" min={0} value={discount} onChange={e => setDiscount(Math.max(0, Number(e.target.value)))} className="w-24" />
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span><span>${total.toLocaleString()}</span>
              </div>
              <Button className="w-full" size="lg" onClick={handleConfirmSale} disabled={cart.length === 0}>
                Confirmar Venta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Client Modal */}
      <Dialog open={newClientModal} onOpenChange={setNewClientModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Cliente Rápido</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nombre *</Label><Input value={newClientName} onChange={e => setNewClientName(e.target.value)} /></div>
            <div><Label>Teléfono *</Label><Input value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewClientModal(false)}>Cancelar</Button>
            <Button onClick={handleQuickClient}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
