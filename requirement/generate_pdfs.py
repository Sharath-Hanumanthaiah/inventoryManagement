#!/usr/bin/env python3
"""Generate page-wise requirement PDFs for Apex Inventory application."""

from fpdf import FPDF
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent


class RequirementPDF(FPDF):
    def __init__(self, title: str):
        super().__init__()
        self.doc_title = title
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, f"Apex Inventory - {self.doc_title}", align="R", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def add_cover(self, page_name: str, route: str, version: str = "1.0.0"):
        self.add_page()
        self.set_font("Helvetica", "B", 22)
        self.set_text_color(30, 41, 59)
        self.cell(0, 20, "Apex Inventory", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(59, 130, 246)
        self.cell(0, 12, "UI Requirement Specification", new_x="LMARGIN", new_y="NEXT")
        self.ln(8)
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(15, 23, 42)
        self.cell(0, 14, page_name, new_x="LMARGIN", new_y="NEXT")
        self.ln(4)
        self.set_font("Helvetica", "", 11)
        self.set_text_color(71, 85, 105)
        self.cell(0, 8, f"Route: {route}", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 8, f"Document Version: {version}", new_x="LMARGIN", new_y="NEXT")
        self.cell(0, 8, "Project: ReactExample (Apex Store Inventory Management)", new_x="LMARGIN", new_y="NEXT")
        self.ln(10)
        self.set_draw_color(226, 232, 240)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(8)

    def section(self, title: str):
        self.ln(4)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(30, 64, 175)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(191, 219, 254)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(3)

    def subsection(self, title: str):
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(51, 65, 85)
        self.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body(self, text: str):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 41, 59)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bullet(self, text: str):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 41, 59)
        x = self.get_x()
        self.cell(6, 5.5, chr(149))
        self.multi_cell(0, 5.5, text)
        self.set_x(x)
        self.ln(1)

    def table_row(self, col1: str, col2: str, header: bool = False):
        if header:
            self.set_font("Helvetica", "B", 9)
            self.set_fill_color(241, 245, 249)
        else:
            self.set_font("Helvetica", "", 9)
            self.set_fill_color(255, 255, 255)
        self.set_text_color(30, 41, 59)
        self.cell(55, 7, col1, border=1, fill=True)
        self.cell(135, 7, col2, border=1, fill=True, new_x="LMARGIN", new_y="NEXT")


def generate_layout_pdf():
    pdf = RequirementPDF("Layout & Navigation")
    pdf.alias_nb_pages()
    pdf.add_cover("Layout & Navigation Shell", "All routes (wrapper component)", "1.0.0")

    pdf.section("1. Overview")
    pdf.body(
        "The Layout component is the persistent application shell that wraps every page in Apex Inventory. "
        "It provides the sidebar navigation, brand identity, real-time alert indicators, and a main content "
        "area where individual page components are rendered via React Router's Outlet. Users never interact "
        "with Layout as a standalone page; it is the structural frame for the entire application."
    )

    pdf.section("2. Purpose")
    pdf.bullet("Provide consistent navigation across all inventory management screens.")
    pdf.bullet("Display global inventory health indicators (low stock count, pending orders).")
    pdf.bullet("Maintain brand identity with the 'Apex Inventory' logo and version footer.")
    pdf.bullet("Host child route content without re-mounting the sidebar on navigation.")

    pdf.section("3. UI Structure")
    pdf.subsection("3.1 Sidebar (Left Panel)")
    pdf.bullet("Brand logo area: Store icon + 'Apex Inventory' text.")
    pdf.bullet("Vertical navigation list with five links (see Navigation Items below).")
    pdf.bullet("Low Stock Alert banner (conditional): shown at bottom of nav when any item has quantity <= 5.")
    pdf.bullet("Footer: displays 'Apex Store v1.0.0'.")
    pdf.subsection("3.2 Main Content Area (Right Panel)")
    pdf.bullet("Renders the active page component through <Outlet />.")
    pdf.bullet("Scrollable region for page-specific content (Dashboard, Inventory, etc.).")

    pdf.section("4. Navigation Items")
    pdf.table_row("Label", "Route / Behavior", header=True)
    pdf.table_row("Dashboard", "/ - Analytics overview, KPIs, charts")
    pdf.table_row("Inventory Items", "/inventory - Search, filter, manage stock")
    pdf.table_row("Add Stock", "/add-stock - Register incoming stock")
    pdf.table_row("Categories & Layout", "/categories - Category CRUD and store map")
    pdf.table_row("Replenish Orders", "/orders - Place and track supplier orders")

    pdf.section("5. Behavior & Interactions")
    pdf.subsection("5.1 Active Route Highlighting")
    pdf.body(
        "Each NavLink uses React Router's isActive callback. The currently active route receives the "
        "'active' CSS class, visually distinguishing it from inactive links. Dashboard uses the 'end' prop "
        "so only exact '/' matches are highlighted (not child paths)."
    )
    pdf.subsection("5.2 Pending Orders Badge")
    pdf.body(
        "On the 'Replenish Orders' nav item, a numeric badge appears when pendingOrdersCount > 0. "
        "The badge shows the count of orders with status 'pending'. Badge styling: secondary color "
        "background, dark text, rounded corners."
    )
    pdf.subsection("5.3 Low Stock Alert Banner")
    pdf.body(
        "When lowStockCount > 0, a red-tinted alert box appears above the sidebar footer. It displays "
        "an AlertTriangle icon and text: 'Low Stock Alert' with '{count} items need attention'. "
        "Low stock is defined as items with quantity <= 5 (includes out-of-stock items at quantity 0)."
    )
    pdf.subsection("5.4 Stats Refresh on Navigation")
    pdf.body(
        "A useEffect hook re-fetches items and orders whenever location.pathname changes. This ensures "
        "sidebar badges and alerts stay current after the user performs actions on other pages "
        "(e.g., placing an order or adjusting stock)."
    )

    pdf.section("6. Data Dependencies")
    pdf.table_row("API Call", "Purpose", header=True)
    pdf.table_row("GET /api/items", "Count items with quantity <= 5 for low stock alert")
    pdf.table_row("GET /api/orders", "Count pending orders for nav badge")

    pdf.section("7. Error Handling")
    pdf.body(
        "If API calls fail, errors are logged to console. The sidebar still renders; badge counts "
        "default to 0. No user-facing error message is shown in the Layout component."
    )

    pdf.section("8. Technical Notes")
    pdf.bullet("Component file: src/components/Layout.tsx")
    pdf.bullet("Icons: lucide-react (Store, LayoutDashboard, Package, PlusCircle, MapPin, Truck, AlertTriangle)")
    pdf.bullet("Routing: nested under <Route path='/' element={<Layout />}> in App.tsx")

    pdf.output(OUTPUT_DIR / "01-Layout-Navigation.pdf")


def generate_dashboard_pdf():
    pdf = RequirementPDF("Dashboard Overview")
    pdf.alias_nb_pages()
    pdf.add_cover("Dashboard Overview", "/", "1.0.0")

    pdf.section("1. Overview")
    pdf.body(
        "The Dashboard is the default landing page (route '/'). It provides a real-time operational "
        "overview of the store inventory: KPI metrics, stock alerts, upcoming deliveries, and "
        "analytics charts for sales trends, product demand comparison, and seasonal performance."
    )

    pdf.section("2. Purpose")
    pdf.bullet("Give managers an at-a-glance view of inventory health.")
    pdf.bullet("Surface urgent stock issues (out of stock, low stock).")
    pdf.bullet("Show replenishment orders arriving within the next 7 days.")
    pdf.bullet("Visualize sales demand trends and seasonal patterns for planning.")

    pdf.section("3. Page Sections")
    pdf.subsection("3.1 Page Header")
    pdf.body("Title: 'Dashboard Overview'. Subtitle: 'Real-time analytics, stock warnings, and seasonal demand intelligence'.")
    pdf.subsection("3.2 KPI Cards (4 cards in a grid)")
    pdf.table_row("KPI", "Calculation", header=True)
    pdf.table_row("Total Unique Items", "Count of all inventory items")
    pdf.table_row("Out of Stock", "Items where quantity === 0")
    pdf.table_row("Low Stock (1-5)", "Items where 0 < quantity <= 5")
    pdf.table_row("Pending Orders", "Orders with status === 'pending'")

    pdf.subsection("3.3 Stock Alert Center (Left panel)")
    pdf.body("Two sub-sections:")
    pdf.bullet("Out of Stock (0 units): Lists items with quantity 0. Shows name, category, 'Out of Stock' badge. Empty state: 'No items are currently out of stock. Excellent!'")
    pdf.bullet("Low Stock Warning (1 to 5 units): Lists items with quantity 1-5. Shows name, category, quantity badge. Empty state: 'No low stock items. Inventory healthy!'")
    pdf.bullet("Header badge shows total alert count (out of stock + low stock).")

    pdf.subsection("3.4 Stocking Up - Coming Week (Right panel)")
    pdf.body(
        "Lists pending orders with expectedArrival between today and 7 days from now. "
        "Each entry shows: item name, arrival date, quantity (+N), physical state. "
        "Empty state: 'No arrivals this week' with truck icon."
    )

    pdf.subsection("3.5 Sales Demand Trend Chart")
    pdf.body(
        "Area chart (Recharts) showing 6-month sales trend (Jan-Jun) for a selected item. "
        "Dropdown selector lists all inventory items; defaults to first item. "
        "Data source: item.salesTrend array (6 values). Y-axis: sales volume. Interactive tooltip on hover."
    )

    pdf.subsection("3.6 Product Demand Comparison Chart")
    pdf.body(
        "Bar chart comparing total demand across all items. Total demand = sum of salesTrend array. "
        "Items sorted descending by demand. Item names truncated to 15 chars if longer."
    )

    pdf.subsection("3.7 Seasonal Product Performance Chart")
    pdf.body(
        "Grouped bar chart across four seasons: Summer, Monsoon, Winter, Spring. "
        "Shows up to first 5 items as separate colored bars per season. "
        "Data source: item.seasonalSales object. Legend displays item names."
    )

    pdf.section("4. Data Loading")
    pdf.body(
        "On mount, fetches GET /api/items and GET /api/orders in parallel via Promise.all. "
        "Errors logged to console; page renders with empty data if fetch fails. "
        "selectedTrendItemId auto-sets to first item ID when items load."
    )

    pdf.section("5. User Interactions")
    pdf.bullet("Item selector dropdown: changes Sales Demand Trend chart to selected item.")
    pdf.bullet("Chart tooltips: hover to see exact values (Recharts built-in).")
    pdf.bullet("No edit/delete actions on Dashboard - read-only analytics view.")

    pdf.section("6. Business Rules")
    pdf.bullet("Low stock threshold: quantity <= 5")
    pdf.bullet("Out of stock: quantity === 0")
    pdf.bullet("Upcoming arrivals: pending orders only, arrival date within next 7 calendar days")
    pdf.bullet("Date comparisons use JavaScript Date objects")

    pdf.section("7. Technical Notes")
    pdf.bullet("Component: src/pages/Dashboard.tsx")
    pdf.bullet("Chart library: recharts (AreaChart, BarChart, ResponsiveContainer)")
    pdf.bullet("Icons: lucide-react")

    pdf.output(OUTPUT_DIR / "02-Dashboard-Overview.pdf")


def generate_inventory_pdf():
    pdf = RequirementPDF("Inventory Items")
    pdf.alias_nb_pages()
    pdf.add_cover("Inventory Items", "/inventory", "1.0.0")

    pdf.section("1. Overview")
    pdf.body(
        "The Inventory Items page is the primary stock management interface. Users can view all "
        "inventory records in a sortable table, search and filter items, adjust quantities inline, "
        "monitor expiry status, see upcoming order arrivals, and delete items."
    )

    pdf.section("2. Purpose")
    pdf.bullet("Central registry of all store inventory with live quantity management.")
    pdf.bullet("Enable quick stock adjustments (+/-) without navigating to Add Stock.")
    pdf.bullet("Filter and search to find specific products efficiently.")
    pdf.bullet("Surface expiry warnings and next replenishment arrival dates.")

    pdf.section("3. Page Header")
    pdf.bullet("Title: 'Inventory Items'. Subtitle: 'View, search, and manage current store items'.")
    pdf.bullet("Filtered Count panel: number of items matching current filters.")
    pdf.bullet("Total Stock Units panel: sum of quantities for filtered items only.")

    pdf.section("4. Search & Filters")
    pdf.subsection("4.1 Search Input")
    pdf.body("Text search matches item name OR category (case-insensitive substring match).")
    pdf.subsection("4.2 Category Filter")
    pdf.body("Dropdown: 'All Categories' or specific category from GET /api/categories.")
    pdf.subsection("4.3 State Filter")
    pdf.body("Options: All States, Solid, Liquid.")
    pdf.subsection("4.4 Stock Status Filter")
    pdf.body("Options: All Statuses, In Stock (>5), Low Stock (1-5), Out of Stock (0).")
    pdf.subsection("4.5 Reset Filters")
    pdf.body("Button appears when any filter is active. Clears all four filter values.")

    pdf.section("5. Inventory Table Columns")
    pdf.table_row("Column", "Description", header=True)
    pdf.table_row("Item Name", "Product name, bold white text")
    pdf.table_row("Category", "Category name string")
    pdf.table_row("State", "Badge: solid (box icon) or liquid (droplet icon)")
    pdf.table_row("Stock Quantity", "Minus/Plus buttons, count, status badge")
    pdf.table_row("Last Stock-In", "Date from item.lastStockIn or 'N/A'")
    pdf.table_row("Next Arrival", "Earliest pending order arrival or 'No orders placed'")
    pdf.table_row("Expiry Status", "Date with expired/expiring soon warnings")
    pdf.table_row("Actions", "Delete button (trash icon)")

    pdf.section("6. Quantity Adjustment Behavior")
    pdf.body(
        "Minus button: decrements quantity by 1, minimum 0. Plus button: increments by 1. "
        "Calls PUT /api/items/:id/quantity with new quantity. Table reloads after update. "
        "If quantity increases above previous value, backend updates lastStockIn to today."
    )

    pdf.section("7. Expiry Logic")
    pdf.bullet("Expired: expiry date is before today (midnight comparison). Shows red 'Expired!' label.")
    pdf.bullet("Expiring soon: expiry within 0-7 days from today. Shows amber 'Expiring soon' label.")
    pdf.bullet("No expiry: displays 'No expiry' in muted text when expiryDate is empty.")

    pdf.section("8. Next Arrival Computation")
    pdf.body(
        "For each item, finds pending orders matching item name (case-insensitive). "
        "Sorts by expectedArrival ascending. Displays earliest date or 'No orders placed'."
    )

    pdf.section("9. Delete Item")
    pdf.body(
        "Trash button triggers confirm dialog: 'Are you sure you want to delete this item from the inventory?' "
        "On confirm: DELETE /api/items/:id, then reload data."
    )

    pdf.section("10. Loading & Empty States")
    pdf.bullet("Loading: 'Loading inventory data...' text shown while fetching.")
    pdf.bullet("Empty filtered results: Layers icon, 'No inventory items found', suggestion to reset filters.")

    pdf.section("11. Data Dependencies")
    pdf.bullet("GET /api/items - inventory list")
    pdf.bullet("GET /api/categories - filter dropdown")
    pdf.bullet("GET /api/orders - next arrival dates")
    pdf.bullet("PUT /api/items/:id/quantity - quantity updates")
    pdf.bullet("DELETE /api/items/:id - item removal")

    pdf.section("12. Technical Notes")
    pdf.bullet("Component: src/pages/InventoryList.tsx")

    pdf.output(OUTPUT_DIR / "03-Inventory-Items.pdf")


def generate_add_stock_pdf():
    pdf = RequirementPDF("Add Stock")
    pdf.alias_nb_pages()
    pdf.add_cover("Add Stock", "/add-stock", "1.0.0")

    pdf.section("1. Overview")
    pdf.body(
        "The Add Stock page allows store staff to register incoming inventory. Users can add quantity "
        "to existing products or create new products. The page includes a session-based recent entries "
        "log for quick reference of additions made during the current browser session."
    )

    pdf.section("2. Purpose")
    pdf.bullet("Record physical stock arrivals into the inventory system.")
    pdf.bullet("Support both restocking existing items and introducing new products.")
    pdf.bullet("Capture expiry dates and stock-in dates for traceability.")
    pdf.bullet("Provide immediate feedback on successful additions.")

    pdf.section("3. Layout")
    pdf.bullet("Left panel: Incoming Stock Form")
    pdf.bullet("Right panel: Recently Logged Arrivals (session history, max 5 entries)")

    pdf.section("4. Form Fields")
    pdf.subsection("4.1 Stock Item Type (Segmented Control)")
    pdf.body(
        "Visible only when existing items exist. Options: 'Existing Item' | 'New Product'. "
        "If no items exist, defaults to 'New Product' mode automatically."
    )
    pdf.subsection("4.2 Item Selection")
    pdf.bullet("Existing mode: dropdown of all items showing name and current quantity.")
    pdf.bullet("New mode: text input for product name (required).")
    pdf.subsection("4.3 Category")
    pdf.bullet("Dropdown from categories API. Disabled (locked) when existing item selected.")
    pdf.bullet("If no categories exist: red warning 'No categories found! Create one first.'")
    pdf.subsection("4.4 Quantity Received")
    pdf.body("Number input, minimum 1, default '10'. Must be positive integer.")
    pdf.subsection("4.5 Physical State")
    pdf.bullet("Existing item: locked badge showing current state (solid/liquid).")
    pdf.bullet("New item: segmented control to choose Solid Product or Liquid Product.")
    pdf.subsection("4.6 Expiry Date")
    pdf.body("Optional date picker. Helper text: 'Leave blank if no expiry'. Auto-filled from existing item when selected.")
    pdf.subsection("4.7 Stock-In Date")
    pdf.body("Required date picker. Defaults to today's date.")

    pdf.section("5. Form Submission Behavior")
    pdf.body("On submit (POST /api/items):")
    pdf.bullet("Existing item with same name: backend merges quantity (adds to existing).")
    pdf.bullet("New item name: creates new inventory record with default salesTrend and seasonalSales.")
    pdf.bullet("Success: green banner for 4 seconds, entry added to recent log, form partially resets.")
    pdf.bullet("New product mode: clears name and expiry after success.")
    pdf.bullet("Existing mode: keeps selection, refreshes item list.")

    pdf.section("6. Validation Rules")
    pdf.bullet("Existing mode: must have valid selected item ID.")
    pdf.bullet("New mode: item name required (non-empty after trim).")
    pdf.bullet("Category required.")
    pdf.bullet("Quantity must be positive number.")
    pdf.bullet("Alerts shown via browser alert() on validation failure.")

    pdf.section("7. Auto-Population on Item Select")
    pdf.body(
        "When existing item is selected, category, physical state, and expiry date auto-populate "
        "from the selected item's current values."
    )

    pdf.section("8. Recent Entries Panel")
    pdf.body(
        "Client-side only (not persisted to server). Stores up to 5 most recent additions in session. "
        "Each entry shows: product name, logged date, quantity added (+N). "
        "Empty state: 'No recent stock added' with History icon."
    )

    pdf.section("9. Data Dependencies")
    pdf.bullet("GET /api/categories - category dropdown")
    pdf.bullet("GET /api/items - existing items list and post-submit refresh")
    pdf.bullet("POST /api/items - add/merge stock")

    pdf.section("10. Technical Notes")
    pdf.bullet("Component: src/pages/AddStock.tsx")

    pdf.output(OUTPUT_DIR / "04-Add-Stock.pdf")


def generate_categories_pdf():
    pdf = RequirementPDF("Categories & Layout")
    pdf.alias_nb_pages()
    pdf.add_cover("Categories & Layout", "/categories", "1.0.0")

    pdf.section("1. Overview")
    pdf.body(
        "The Categories & Layout page manages product category definitions and their physical "
        "placement within the store. Each category maps to a specific aisle, section, and shelf "
        "location. A visual aisle layout map shows how categories are distributed across the store."
    )

    pdf.section("2. Purpose")
    pdf.bullet("Define and organize product categories for inventory classification.")
    pdf.bullet("Map categories to physical store coordinates (aisle, section, shelf).")
    pdf.bullet("Provide a visual store layout overview for staff orientation.")
    pdf.bullet("Enable category deletion with dependency warnings.")

    pdf.section("3. Layout")
    pdf.bullet("Top row: Create Category form (left) + Configured Categories list (right)")
    pdf.bullet("Bottom: Visual Aisle Layout map (full width)")

    pdf.section("4. Create Category Form")
    pdf.subsection("4.1 Category Name")
    pdf.body("Required text input. Placeholder: 'e.g. Fresh Produce, Canned, Snacks'.")
    pdf.subsection("4.2 Description")
    pdf.body("Optional textarea (3 rows) for category description.")
    pdf.subsection("4.3 Store Placement Coordinates")
    pdf.bullet("Aisle: Aisle 1-5 with descriptive labels (Dairy & Drinks, Bakery & Snacks, etc.)")
    pdf.bullet("Section: Section A-D (Front-end, Middle, Back-end, Promo Endcap)")
    pdf.bullet("Shelf Level: Shelf 1-4 (Bottom to Top/Eye Level)")
    pdf.subsection("4.4 Submit")
    pdf.body("Button: 'Create & Map Category'. POST /api/categories. Resets form to defaults on success.")

    pdf.section("5. Configured Categories List")
    pdf.body("Scrollable list (max-height 420px) showing all categories. Each card displays:")
    pdf.bullet("Category name (title)")
    pdf.bullet("Description or 'No description provided.'")
    pdf.bullet("Badges: aisle, section, shelf")
    pdf.bullet("Delete button (trash icon)")
    pdf.body("Empty state: 'No categories registered' with guidance to create first category.")

    pdf.section("6. Delete Category Behavior")
    pdf.body("Before deletion, checks if any inventory items use this category (case-insensitive name match).")
    pdf.bullet("If items exist: warning confirm with item count and unmapped category notice.")
    pdf.bullet("If no items: standard confirm dialog.")
    pdf.bullet("On confirm: DELETE /api/categories/:id, refresh list.")
    pdf.body("Note: Deleting category does NOT remove or reassign inventory items.")

    pdf.section("7. Visual Aisle Layout")
    pdf.body(
        "Grid of 5 aisle cells (Aisle 1 through Aisle 5). Each cell shows:")
    pdf.bullet("Aisle label at top")
    pdf.bullet("Category names assigned to that aisle (or 'Empty Aisle' if none)")
    pdf.bullet("Active styling when aisle has at least one category")
    pdf.bullet("Tooltip on category: name, section, shelf")
    pdf.body("Empty state when no categories: 'No Aisle Maps Available'.")

    pdf.section("8. Aisle Grouping Logic")
    pdf.body(
        "Categories grouped by aisle field. Categories without aisle map to 'Unmapped' key "
        "(not shown in the 5-aisle grid which only displays Aisle 1-5)."
    )

    pdf.section("9. Data Dependencies")
    pdf.bullet("GET /api/categories - list and refresh")
    pdf.bullet("GET /api/items - dependency check on delete")
    pdf.bullet("POST /api/categories - create")
    pdf.bullet("DELETE /api/categories/:id - remove")

    pdf.section("10. Technical Notes")
    pdf.bullet("Component: src/pages/Categories.tsx")

    pdf.output(OUTPUT_DIR / "05-Categories-Layout.pdf")


def generate_place_order_pdf():
    pdf = RequirementPDF("Replenish Orders")
    pdf.alias_nb_pages()
    pdf.add_cover("Replenish Orders", "/orders", "1.0.0")

    pdf.section("1. Overview")
    pdf.body(
        "The Replenish Orders page manages supplier replenishment orders. Users can place new orders "
        "for existing or new products, track pending deliveries, mark orders as received (which "
        "auto-updates inventory), cancel pending orders, and view completed order history."
    )

    pdf.section("2. Purpose")
    pdf.bullet("Schedule future stock replenishment from suppliers.")
    pdf.bullet("Track in-transit orders with expected arrival dates.")
    pdf.bullet("Receive deliveries and automatically update inventory quantities.")
    pdf.bullet("Maintain audit trail of completed orders.")

    pdf.section("3. Layout")
    pdf.bullet("Top row: Place Order form (left) + Pending Deliveries list (right)")
    pdf.bullet("Bottom: Completed Orders History table (full width)")

    pdf.section("4. Place Order Form")
    pdf.subsection("4.1 Order Item Selection")
    pdf.body(
        "Segmented control (when items exist): 'Restock Existing Item' | 'Order New Product'. "
        "Defaults to select mode; switches to type mode if no items exist."
    )
    pdf.subsection("4.2 Item Input")
    pdf.bullet("Select mode: dropdown with item name and current quantity.")
    pdf.bullet("Type mode: text input for new product name.")
    pdf.subsection("4.3 Category")
    pdf.body("Dropdown from categories. Disabled when restocking existing item (auto-filled).")
    pdf.subsection("4.4 Physical State")
    pdf.bullet("Select mode: read-only badge from item.")
    pdf.bullet("Type mode: Solid / Liquid segmented control.")
    pdf.subsection("4.5 Quantity to Order")
    pdf.body("Number input, min 1, default '50'.")
    pdf.subsection("4.6 Total Cost")
    pdf.body("Number input with dollar icon, min 0, default '100'.")
    pdf.subsection("4.7 Expected Arrival Date")
    pdf.body("Date picker, required. Defaults to 5 days from today on page load.")
    pdf.subsection("4.8 Submit")
    pdf.body("Button: 'Place Replenish Order'. Creates order with status 'pending'.")

    pdf.section("5. Form Validation")
    pdf.bullet("Select mode: valid item must be selected.")
    pdf.bullet("Type mode: product name required.")
    pdf.bullet("Category required.")
    pdf.bullet("Quantity must be positive number.")
    pdf.bullet("Price must be non-negative number.")
    pdf.bullet("Expected arrival date required.")
    pdf.body("Success alert: 'Replenish order placed successfully!' Form resets quantity to 50, price to 100.")

    pdf.section("6. Pending Deliveries Panel")
    pdf.body("Lists all orders with status 'pending'. Each card shows:")
    pdf.bullet("Item name and category badge")
    pdf.bullet("Quantity, physical state, cost")
    pdf.bullet("Expected arrival date")
    pdf.bullet("Receive button - marks order delivered")
    pdf.bullet("Cancel button - deletes pending order")
    pdf.body("Scrollable (max 420px). Empty state: 'No orders in transit'.")

    pdf.section("7. Receive Order Behavior")
    pdf.body("On 'Receive' click (POST /api/orders/:id/deliver):")
    pdf.bullet("Order status changes to 'delivered'.")
    pdf.bullet("If matching inventory item exists (by name): quantity increased by order quantity, lastStockIn updated.")
    pdf.bullet("If no matching item: new inventory item created with 30-day default expiry, default analytics data.")
    pdf.body("Success alert: 'Order marked as delivered! Inventory stock has been automatically updated.'")

    pdf.section("8. Cancel Order Behavior")
    pdf.body(
        "Confirm dialog: 'Are you sure you want to cancel this order?' "
        "DELETE /api/orders/:id. Order removed from system. No inventory change."
    )

    pdf.section("9. Completed Orders History")
    pdf.body("Table of delivered orders with columns:")
    pdf.table_row("Column", "Data", header=True)
    pdf.table_row("Product Name", "order.itemName")
    pdf.table_row("Category", "order.category")
    pdf.table_row("Quantity Received", "order.quantity")
    pdf.table_row("Physical State", "solid/liquid badge")
    pdf.table_row("Cost Paid", "order.price ($)")
    pdf.table_row("Ordered On", "order.orderDate")
    pdf.table_row("Arrival Date", "order.expectedArrival")
    pdf.table_row("Status", "Delivered badge")
    pdf.body("Empty state: 'No order history' when no delivered orders exist.")

    pdf.section("10. Auto-Population")
    pdf.body(
        "When existing item selected in restock mode, category and physical state auto-populate. "
        "First category auto-selected when categories load and none selected."
    )

    pdf.section("11. Data Dependencies")
    pdf.bullet("GET /api/orders, /api/categories, /api/items - load data")
    pdf.bullet("POST /api/orders - place order")
    pdf.bullet("POST /api/orders/:id/deliver - receive delivery")
    pdf.bullet("DELETE /api/orders/:id - cancel order")

    pdf.section("12. Technical Notes")
    pdf.bullet("Component: src/pages/PlaceOrder.tsx")
    pdf.bullet("Route alias in nav: 'Replenish Orders' at /orders")

    pdf.output(OUTPUT_DIR / "06-Replenish-Orders.pdf")


def generate_overview_pdf():
    pdf = RequirementPDF("Application Overview")
    pdf.alias_nb_pages()
    pdf.add_cover("Application Overview", "All routes", "1.0.0")

    pdf.section("1. Application Summary")
    pdf.body(
        "Apex Inventory (Apex Store v1.0.0) is a React-based inventory management application "
        "for retail store operations. It provides dashboard analytics, inventory CRUD, stock "
        "intake, category management with store layout mapping, and supplier replenishment order "
        "tracking. Data is persisted via a mock Express backend (mock-backend/server.js) using db.json."
    )

    pdf.section("2. Technology Stack")
    pdf.bullet("Frontend: React 19, TypeScript, Vite, React Router DOM 7")
    pdf.bullet("Charts: Recharts")
    pdf.bullet("Icons: Lucide React")
    pdf.bullet("Backend: Express.js mock API on port 5001")
    pdf.bullet("API proxy: /api routes proxied to backend via Vite config")

    pdf.section("3. Route Map")
    pdf.table_row("Route", "Page Component", header=True)
    pdf.table_row("/", "Dashboard")
    pdf.table_row("/inventory", "InventoryList")
    pdf.table_row("/add-stock", "AddStock")
    pdf.table_row("/categories", "Categories")
    pdf.table_row("/orders", "PlaceOrder")
    pdf.table_row("*", "Redirect to /")

    pdf.section("4. Core Data Models")
    pdf.subsection("4.1 InventoryItem")
    pdf.body("id, name, category, quantity, state (liquid|solid), expiryDate, lastStockIn, salesTrend[6], seasonalSales{summer,monsoon,winter,spring}")
    pdf.subsection("4.2 Category")
    pdf.body("id, name, description, aisle, section, shelf")
    pdf.subsection("4.3 Order")
    pdf.body("id, itemName, category, quantity, state, orderDate, expectedArrival, status (pending|delivered), price")

    pdf.section("5. API Endpoints Summary")
    pdf.table_row("Method", "Endpoint", header=True)
    pdf.table_row("GET", "/api/items")
    pdf.table_row("POST", "/api/items")
    pdf.table_row("PUT", "/api/items/:id/quantity")
    pdf.table_row("DELETE", "/api/items/:id")
    pdf.table_row("GET", "/api/categories")
    pdf.table_row("POST", "/api/categories")
    pdf.table_row("DELETE", "/api/categories/:id")
    pdf.table_row("GET", "/api/orders")
    pdf.table_row("POST", "/api/orders")
    pdf.table_row("POST", "/api/orders/:id/deliver")
    pdf.table_row("DELETE", "/api/orders/:id")

    pdf.section("6. Cross-Page Business Rules")
    pdf.bullet("Low stock: quantity <= 5 (used in Dashboard, Layout, Inventory filters)")
    pdf.bullet("Out of stock: quantity === 0")
    pdf.bullet("In stock: quantity > 5")
    pdf.bullet("Item name matching is case-insensitive for merge/delivery operations")
    pdf.bullet("Categories must exist before adding stock or placing orders for new products")

    pdf.section("7. Requirement Documents Index")
    pdf.bullet("01-Layout-Navigation.pdf - App shell and sidebar")
    pdf.bullet("02-Dashboard-Overview.pdf - Analytics landing page")
    pdf.bullet("03-Inventory-Items.pdf - Stock list and management")
    pdf.bullet("04-Add-Stock.pdf - Stock intake form")
    pdf.bullet("05-Categories-Layout.pdf - Category CRUD and store map")
    pdf.bullet("06-Replenish-Orders.pdf - Order placement and tracking")

    pdf.output(OUTPUT_DIR / "00-Application-Overview.pdf")


if __name__ == "__main__":
    generate_overview_pdf()
    generate_layout_pdf()
    generate_dashboard_pdf()
    generate_inventory_pdf()
    generate_add_stock_pdf()
    generate_categories_pdf()
    generate_place_order_pdf()
    print("Generated PDFs in", OUTPUT_DIR)
