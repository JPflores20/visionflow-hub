import { useState } from "react";
import { useStore, Client, Prescription } from "@/context/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emptyRx: Prescription = { odSphere: "", odCylinder: "", odAxis: "", odAddition: "", oiSphere: "", oiCylinder: "", oiAxis: "", oiAddition: "" };

const emptyClient = (): Omit<Client, "id"> => ({
  fullName: "", phone: "", email: "", lastExamDate: "", examInStore: false,
  prescription: { ...emptyRx }, notes: "", lastPurchaseDate: "",
});

export default function ClientesPage() {
  const { clients, addClient, updateClient, deleteClient } = useStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [viewing, setViewing] = useState<Client | null>(null);
  const [form, setForm] = useState<Omit<Client, "id">>(emptyClient());

  const filtered = clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditing(null); setForm(emptyClient()); setModalOpen(true); };
  const openEdit = (c: Client) => { setEditing(c); setForm({ ...c }); setModalOpen(true); };
  const openDetail = (c: Client) => { setViewing(c); setDetailOpen(true); };

  const handleSave = () => {
    if (!form.fullName.trim() || !form.phone.trim()) {
      toast({ title: "Error", description: "Nombre y teléfono son obligatorios.", variant: "destructive" });
      return;
    }
    if (editing) { updateClient({ ...form, id: editing.id }); }
    else { addClient(form); }
    setModalOpen(false);
    toast({ title: editing ? "Cliente actualizado" : "Cliente agregado" });
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
    toast({ title: "Cliente eliminado" });
  };

  const setField = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));
  const setRx = (key: string, val: string) => setForm(prev => ({ ...prev, prescription: { ...prev.prescription, [key]: val } }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Clientes / Pacientes</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nuevo Cliente</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre o email..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Último Examen</TableHead>
                <TableHead className="hidden lg:table-cell">Última Compra</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.fullName}</TableCell>
                  <TableCell className="hidden md:table-cell">{c.phone}</TableCell>
                  <TableCell className="hidden md:table-cell">{c.email}</TableCell>
                  <TableCell className="hidden lg:table-cell">{c.lastExamDate || "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell">{c.lastPurchaseDate || "—"}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openDetail(c)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No se encontraron clientes</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>Nombre Completo *</Label><Input value={form.fullName} onChange={e => setField("fullName", e.target.value)} /></div>
              <div><Label>Teléfono *</Label><Input value={form.phone} onChange={e => setField("phone", e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setField("email", e.target.value)} /></div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Historial Clínico</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-3">
                <div><Label>Fecha Último Examen</Label><Input type="date" value={form.lastExamDate} onChange={e => setField("lastExamDate", e.target.value)} /></div>
                <div className="flex items-end gap-2">
                  <Checkbox id="examInStore" checked={form.examInStore} onCheckedChange={v => setField("examInStore", v)} />
                  <Label htmlFor="examInStore">Examen realizado en tienda</Label>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Receta — Ojo Derecho (OD)</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div><Label className="text-xs">Esfera</Label><Input value={form.prescription.odSphere} onChange={e => setRx("odSphere", e.target.value)} /></div>
                <div><Label className="text-xs">Cilindro</Label><Input value={form.prescription.odCylinder} onChange={e => setRx("odCylinder", e.target.value)} /></div>
                <div><Label className="text-xs">Eje</Label><Input value={form.prescription.odAxis} onChange={e => setRx("odAxis", e.target.value)} /></div>
                <div><Label className="text-xs">Adición</Label><Input value={form.prescription.odAddition} onChange={e => setRx("odAddition", e.target.value)} /></div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Receta — Ojo Izquierdo (OI)</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div><Label className="text-xs">Esfera</Label><Input value={form.prescription.oiSphere} onChange={e => setRx("oiSphere", e.target.value)} /></div>
                <div><Label className="text-xs">Cilindro</Label><Input value={form.prescription.oiCylinder} onChange={e => setRx("oiCylinder", e.target.value)} /></div>
                <div><Label className="text-xs">Eje</Label><Input value={form.prescription.oiAxis} onChange={e => setRx("oiAxis", e.target.value)} /></div>
                <div><Label className="text-xs">Adición</Label><Input value={form.prescription.oiAddition} onChange={e => setRx("oiAddition", e.target.value)} /></div>
              </div>
              <div><Label>Notas</Label><Textarea value={form.notes} onChange={e => setField("notes", e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? "Guardar Cambios" : "Agregar Cliente"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Cliente</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <p><strong>Nombre:</strong> {viewing.fullName}</p>
              <p><strong>Teléfono:</strong> {viewing.phone}</p>
              <p><strong>Email:</strong> {viewing.email}</p>
              <p><strong>Último Examen:</strong> {viewing.lastExamDate || "—"} {viewing.examInStore ? "(En tienda)" : "(Receta externa)"}</p>
              <div>
                <strong>Receta OD:</strong> Esf {viewing.prescription.odSphere || "—"} / Cil {viewing.prescription.odCylinder || "—"} / Eje {viewing.prescription.odAxis || "—"} / Add {viewing.prescription.odAddition || "—"}
              </div>
              <div>
                <strong>Receta OI:</strong> Esf {viewing.prescription.oiSphere || "—"} / Cil {viewing.prescription.oiCylinder || "—"} / Eje {viewing.prescription.oiAxis || "—"} / Add {viewing.prescription.oiAddition || "—"}
              </div>
              <p><strong>Notas:</strong> {viewing.notes || "—"}</p>
              <p><strong>Última Compra:</strong> {viewing.lastPurchaseDate || "—"}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
