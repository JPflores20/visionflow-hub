import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// --- Types ---
export interface Prescription {
  odSphere: string; odCylinder: string; odAxis: string; odAddition: string;
  oiSphere: string; oiCylinder: string; oiAxis: string; oiAddition: string;
}

export interface Client {
  id: string; fullName: string; phone: string; email: string;
  lastExamDate: string; examInStore: boolean;
  prescription: Prescription;
  notes: string; lastPurchaseDate: string;
}

export interface Product {
  id: string; sku: string; brand: string; model: string;
  type: "frame" | "single-vision" | "bifocal" | "progressive" | "contact";
  category: "frames" | "lenses";
  costPrice: number; sellingPrice: number; stock: number;
}

export interface SaleItem {
  productId: string; productName: string; quantity: number;
  unitPrice: number; costPrice: number;
}

export interface Sale {
  id: string; clientId: string; clientName: string;
  items: SaleItem[]; subtotal: number; discount: number; total: number;
  profit: number; date: string;
}

// --- Mock Data ---
const today = new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const initialClients: Client[] = [
  { id: "c1", fullName: "María García López", phone: "555-0101", email: "maria@email.com", lastExamDate: daysAgo(30), examInStore: true, prescription: { odSphere: "-2.00", odCylinder: "-0.75", odAxis: "180", odAddition: "", oiSphere: "-1.75", oiCylinder: "-0.50", oiAxis: "175", oiAddition: "" }, notes: "Prefiere armazones ligeros", lastPurchaseDate: daysAgo(30) },
  { id: "c2", fullName: "Carlos Rodríguez Pérez", phone: "555-0202", email: "carlos@email.com", lastExamDate: daysAgo(60), examInStore: false, prescription: { odSphere: "+1.50", odCylinder: "-0.25", odAxis: "90", odAddition: "+2.00", oiSphere: "+1.25", oiCylinder: "-0.50", oiAxis: "85", oiAddition: "+2.00" }, notes: "Usa lentes progresivos", lastPurchaseDate: daysAgo(15) },
  { id: "c3", fullName: "Ana Martínez Ruiz", phone: "555-0303", email: "ana@email.com", lastExamDate: daysAgo(90), examInStore: true, prescription: { odSphere: "-4.00", odCylinder: "-1.25", odAxis: "10", odAddition: "", oiSphere: "-3.75", oiCylinder: "-1.00", oiAxis: "170", oiAddition: "" }, notes: "", lastPurchaseDate: daysAgo(5) },
  { id: "c4", fullName: "Roberto Sánchez Villa", phone: "555-0404", email: "roberto@email.com", lastExamDate: daysAgo(120), examInStore: true, prescription: { odSphere: "-0.50", odCylinder: "", odAxis: "", odAddition: "", oiSphere: "-0.75", oiCylinder: "", oiAxis: "", oiAddition: "" }, notes: "Solo para conducir", lastPurchaseDate: daysAgo(120) },
  { id: "c5", fullName: "Laura Díaz Fernández", phone: "555-0505", email: "laura@email.com", lastExamDate: daysAgo(10), examInStore: false, prescription: { odSphere: "-3.25", odCylinder: "-0.50", odAxis: "45", odAddition: "", oiSphere: "-3.00", oiCylinder: "-0.75", oiAxis: "135", oiAddition: "" }, notes: "Interesada en lentes de contacto", lastPurchaseDate: daysAgo(10) },
];

const initialProducts: Product[] = [
  { id: "p1", sku: "ARM-001", brand: "Ray-Ban", model: "Aviator Classic", type: "frame", category: "frames", costPrice: 800, sellingPrice: 1800, stock: 12 },
  { id: "p2", sku: "ARM-002", brand: "Oakley", model: "Holbrook", type: "frame", category: "frames", costPrice: 950, sellingPrice: 2200, stock: 8 },
  { id: "p3", sku: "ARM-003", brand: "Guess", model: "GU2700", type: "frame", category: "frames", costPrice: 600, sellingPrice: 1400, stock: 3 },
  { id: "p4", sku: "ARM-004", brand: "Vogue", model: "VO5286", type: "frame", category: "frames", costPrice: 500, sellingPrice: 1200, stock: 15 },
  { id: "p5", sku: "ARM-005", brand: "Michael Kors", model: "MK3053", type: "frame", category: "frames", costPrice: 1100, sellingPrice: 2500, stock: 2 },
  { id: "p6", sku: "LEN-001", brand: "Essilor", model: "Crizal Alizé", type: "single-vision", category: "lenses", costPrice: 400, sellingPrice: 950, stock: 25 },
  { id: "p7", sku: "LEN-002", brand: "Essilor", model: "Varilux Comfort", type: "progressive", category: "lenses", costPrice: 1200, sellingPrice: 2800, stock: 10 },
  { id: "p8", sku: "LEN-003", brand: "Hoya", model: "Nulux EP", type: "single-vision", category: "lenses", costPrice: 350, sellingPrice: 850, stock: 4 },
  { id: "p9", sku: "LEN-004", brand: "Zeiss", model: "SmartLife Bifocal", type: "bifocal", category: "lenses", costPrice: 900, sellingPrice: 2100, stock: 6 },
  { id: "p10", sku: "CON-001", brand: "Acuvue", model: "Oasys", type: "contact", category: "lenses", costPrice: 250, sellingPrice: 600, stock: 30 },
];

const initialSales: Sale[] = [
  { id: "s1", clientId: "c1", clientName: "María García López", items: [{ productId: "p1", productName: "Ray-Ban Aviator Classic", quantity: 1, unitPrice: 1800, costPrice: 800 }, { productId: "p6", productName: "Essilor Crizal Alizé", quantity: 2, unitPrice: 950, costPrice: 400 }], subtotal: 3700, discount: 200, total: 3500, profit: 1900, date: daysAgo(0) },
  { id: "s2", clientId: "c2", clientName: "Carlos Rodríguez Pérez", items: [{ productId: "p2", productName: "Oakley Holbrook", quantity: 1, unitPrice: 2200, costPrice: 950 }, { productId: "p7", productName: "Essilor Varilux Comfort", quantity: 2, unitPrice: 2800, costPrice: 1200 }], subtotal: 7800, discount: 500, total: 7300, profit: 3950, date: daysAgo(1) },
  { id: "s3", clientId: "c3", clientName: "Ana Martínez Ruiz", items: [{ productId: "p4", productName: "Vogue VO5286", quantity: 1, unitPrice: 1200, costPrice: 500 }, { productId: "p8", productName: "Hoya Nulux EP", quantity: 2, unitPrice: 850, costPrice: 350 }], subtotal: 2900, discount: 0, total: 2900, profit: 1700, date: daysAgo(2) },
  { id: "s4", clientId: "c5", clientName: "Laura Díaz Fernández", items: [{ productId: "p10", productName: "Acuvue Oasys", quantity: 4, unitPrice: 600, costPrice: 250 }], subtotal: 2400, discount: 100, total: 2300, profit: 900, date: daysAgo(3) },
  { id: "s5", clientId: "c4", clientName: "Roberto Sánchez Villa", items: [{ productId: "p3", productName: "Guess GU2700", quantity: 1, unitPrice: 1400, costPrice: 600 }, { productId: "p6", productName: "Essilor Crizal Alizé", quantity: 2, unitPrice: 950, costPrice: 400 }], subtotal: 3300, discount: 150, total: 3150, profit: 1500, date: daysAgo(4) },
  { id: "s6", clientId: "c1", clientName: "María García López", items: [{ productId: "p5", productName: "Michael Kors MK3053", quantity: 1, unitPrice: 2500, costPrice: 1100 }], subtotal: 2500, discount: 0, total: 2500, profit: 1400, date: daysAgo(5) },
  { id: "s7", clientId: "c3", clientName: "Ana Martínez Ruiz", items: [{ productId: "p9", productName: "Zeiss SmartLife Bifocal", quantity: 2, unitPrice: 2100, costPrice: 900 }], subtotal: 4200, discount: 300, total: 3900, profit: 2100, date: daysAgo(6) },
];

// --- Context ---
interface StoreContextType {
  clients: Client[];
  products: Product[];
  sales: Sale[];
  addClient: (c: Omit<Client, "id">) => Client;
  updateClient: (c: Client) => void;
  deleteClient: (id: string) => void;
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (p: Product) => void;
  updateStock: (id: string, delta: number) => void;
  addSale: (s: Omit<Sale, "id">) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

let nextId = 100;
const genId = (prefix: string) => `${prefix}${nextId++}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sales, setSales] = useState<Sale[]>(initialSales);

  const addClient = useCallback((c: Omit<Client, "id">) => {
    const newClient = { ...c, id: genId("c") };
    setClients(prev => [...prev, newClient]);
    return newClient;
  }, []);

  const updateClient = useCallback((c: Client) => {
    setClients(prev => prev.map(x => x.id === c.id ? c : x));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(x => x.id !== id));
  }, []);

  const addProduct = useCallback((p: Omit<Product, "id">) => {
    setProducts(prev => [...prev, { ...p, id: genId("p") }]);
  }, []);

  const updateProduct = useCallback((p: Product) => {
    setProducts(prev => prev.map(x => x.id === p.id ? p : x));
  }, []);

  const updateStock = useCallback((id: string, delta: number) => {
    setProducts(prev => prev.map(x => x.id === id ? { ...x, stock: Math.max(0, x.stock + delta) } : x));
  }, []);

  const addSale = useCallback((s: Omit<Sale, "id">) => {
    const newSale = { ...s, id: genId("s") };
    setSales(prev => [...prev, newSale]);
    // Reduce inventory
    s.items.forEach(item => {
      setProducts(prev => prev.map(p => p.id === item.productId ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p));
    });
    // Update client last purchase date
    setClients(prev => prev.map(c => c.id === s.clientId ? { ...c, lastPurchaseDate: s.date } : c));
  }, []);

  return (
    <StoreContext.Provider value={{ clients, products, sales, addClient, updateClient, deleteClient, addProduct, updateProduct, updateStock, addSale }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be within StoreProvider");
  return ctx;
}
