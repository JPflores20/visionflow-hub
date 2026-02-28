

# Ópticas Visión 2000 — Dashboard Application

## Design
- Color palette: shades of blue, white, and light gray (eye health theme)
- Sidebar navigation with collapsible support using shadcn Sidebar
- Responsive layout with Tailwind CSS, modern cards, tables, and modals
- Lucide React icons throughout

## Modules

### 1. Dashboard (Home)
- KPI cards: Today's Earnings, Monthly Earnings, Total Sales, Low Inventory Alerts
- Bar/line chart (recharts) showing last 7 days of sales
- Table with last 5 completed sales

### 2. Client / Patient Management
- Searchable client table with full CRUD
- "Add New Client" modal form with fields: Full Name, Phone, Email
- Clinical history section: last exam date, in-store vs. external prescription checkbox, detailed Rx (OD/OS: Sphere, Cylinder, Axis, Addition), notes
- Purchase history: last glasses sale date

### 3. Inventory (Product Catalog)
- Tabs: "Armazones" (Frames) and "Micas/Lentes de contacto" (Lenses/Contacts)
- Table: SKU, Brand, Model, Type, Cost Price, Selling Price, Stock
- Red/orange badges for stock < 5
- Modal form for stock entry/exit

### 4. Point of Sale (POS)
- Client search/select or quick-create
- Product search to add items to cart
- Cost breakdown: Subtotal, Discounts, Total
- "Confirm Sale" button updates inventory and records profit

### 5. Reports & Finances
- Net and gross profit calculations
- Filters by day, week, month

### Technical
- Global mock data store using React context for interactivity
- Form validation (required fields) using react-hook-form + zod
- All data flows connected: sales reduce inventory, update client history, reflect in dashboard KPIs

