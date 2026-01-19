# Budget App - Component Specification

## Table of Contents
1. [Design System](#design-system)
2. [Component Tree](#component-tree)
3. [Detailed Component Specifications](#detailed-component-specifications)
4. [Data Models & API](#data-models--api)
5. [Routing Structure](#routing-structure)
6. [State Management](#state-management)
7. [Real-time Updates](#real-time-updates)

---

## Design System

### Colors
```typescript
// Primary Colors
const colors = {
  background: {
    primary: '#0a0e14',
    secondary: '#121720',
    tertiary: '#1a1f2e',
    card: '#151b26',
    elevated: '#1e2433',
  },
  accent: {
    primary: '#00d4ff',      // Cyan
    success: '#00ffa3',      // Green
    warning: '#ffa940',      // Orange
    danger: '#ff6b9d',       // Pink
    purple: '#b47aff',       // Purple
  },
  text: {
    primary: '#ffffff',
    secondary: '#8892a6',
    tertiary: '#5a6272',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    medium: 'rgba(255, 255, 255, 0.1)',
  },
};
```

### Typography
```typescript
const typography = {
  fontFamily: {
    ui: "'Sora', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    md: '15px',
    lg: '17px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '36px',
    '5xl': '48px',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.6,
    relaxed: 1.8,
  },
};
```

### Spacing
```typescript
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};
```

### Border Radius
```typescript
const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};
```

### Shadows
```typescript
const shadows = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.12)',
  md: '0 4px 16px rgba(0, 0, 0, 0.16)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.24)',
  glow: '0 0 32px rgba(0, 212, 255, 0.15)',
};
```

### Breakpoints
```typescript
const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1400px',
};
```

---

## Component Tree

```
App
├── AppShell
│   ├── Sidebar (Desktop)
│   │   ├── Logo
│   │   ├── PeriodSelector
│   │   ├── Navigation
│   │   │   ├── NavSection
│   │   │   │   └── NavItem (multiple)
│   │   │   └── NavSection (multiple)
│   │   └── UserMenu
│   │       └── UserProfile
│   │
│   ├── MobileTopBar
│   │   ├── MobileMenuButton
│   │   ├── MobileLogo
│   │   └── MobilePeriod
│   │
│   ├── BottomNavigation (Mobile)
│   │   └── BottomNavItem (multiple)
│   │
│   └── MainContent
│       └── [Page Content]
│
├── Pages
│   ├── DashboardPage
│   │   ├── PageHeader
│   │   ├── StatsGrid
│   │   │   └── StatCard (multiple)
│   │   ├── ChartsSection
│   │   │   ├── BalanceOverTimeChart
│   │   │   └── TopCategoriesChart
│   │   └── RecentActivityTable
│   │       └── TransactionRow (multiple)
│   │
│   ├── TransactionsPage
│   │   ├── PageHeader
│   │   ├── QuickAddForm
│   │   │   ├── FormField (multiple)
│   │   │   ├── QuickSubmitButton
│   │   │   └── SuggestionChips
│   │   ├── StatsSummary
│   │   │   └── SummaryCard (multiple)
│   │   ├── FiltersBar
│   │   │   ├── FilterTabs
│   │   │   └── QuickFilters
│   │   └── TransactionsTable
│   │       ├── TransactionsHeader
│   │       ├── TransactionGroup (multiple)
│   │       │   ├── GroupDate
│   │       │   └── TransactionRow (multiple)
│   │       └── SearchBox
│   │
│   ├── BudgetPage
│   │   ├── PageHeader
│   │   ├── BudgetOverview
│   │   │   ├── BudgetAllocationChart
│   │   │   └── BudgetBreakdown
│   │   ├── BudgetCategoriesSection
│   │   │   ├── CardHeader
│   │   │   └── CategoryBudgetItem (multiple)
│   │   └── UnbudgetedSection
│   │
│   ├── AccountsPage
│   │   ├── PageHeader
│   │   ├── SummaryGrid
│   │   │   └── SummaryCard (multiple)
│   │   └── AccountsGrid
│   │       └── AccountCard (multiple)
│   │           ├── AccountHeader
│   │           ├── AccountBalance
│   │           ├── AccountChart
│   │           ├── AccountStats
│   │           ├── AccountStatus
│   │           └── QuickActions
│   │
│   └── CategoriesPage
│       ├── PageHeader
│       ├── FilterTabs
│       └── CategoriesGrid
│           └── CategoryCard (multiple)
│               ├── CategoryHeader
│               ├── CategoryInfo
│               └── CategoryStats
│
└── Shared Components
    ├── Button
    ├── Input
    ├── Select
    ├── Badge
    ├── Card
    ├── Modal
    ├── Dropdown
    ├── Chart
    ├── ProgressBar
    ├── Spinner
    └── EmptyState
```

---

## Detailed Component Specifications

### 1. Layout Components

#### `AppShell`
Main application layout wrapper that handles responsive sidebar/bottom nav switching.

**Props:**
```typescript
interface AppShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  currentPeriod: BudgetPeriod;
  onPeriodChange: (period: BudgetPeriod) => void;
}
```

**State:**
```typescript
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [isMobile, setIsMobile] = useState(false);
```

**Events:**
- `onPeriodChange`: Called when user selects a different period
- `toggleSidebar`: Opens/closes mobile sidebar
- `closeSidebar`: Closes mobile sidebar (on overlay click or navigation)

**Mantine Components:**
- `AppShell` (from @mantine/core)
- `AppShell.Navbar`
- `AppShell.Main`

---

#### `Sidebar`
Desktop left sidebar with navigation and user profile.

**Props:**
```typescript
interface SidebarProps {
  currentRoute: string;
  currentPeriod: BudgetPeriod;
  onPeriodChange: (period: BudgetPeriod) => void;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  notificationCounts?: {
    transactions?: number;
  };
}
```

**Styling:**
```css
width: 280px;
background: #121720;
border-right: 1px solid rgba(255, 255, 255, 0.06);
```

**Children:**
- `Logo`
- `PeriodSelector`
- `Navigation`
- `UserMenu`

---

#### `Logo`
Application logo and branding.

**Props:**
```typescript
interface LogoProps {
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}
```

**Styling:**
```css
display: flex;
align-items: center;
gap: 16px;
font-size: 24px;
font-weight: 700;

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #00d4ff 0%, #b47aff 100%);
  border-radius: 12px;
  font-size: 20px;
}

.logo-text {
  background: linear-gradient(135deg, #ffffff 0%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

#### `PeriodSelector`
Dropdown to select budget period (month/year).

**Props:**
```typescript
interface PeriodSelectorProps {
  currentPeriod: BudgetPeriod;
  periods: BudgetPeriod[];
  onChange: (period: BudgetPeriod) => void;
  loading?: boolean;
}
```

**State:**
```typescript
const [isOpen, setIsOpen] = useState(false);
```

**Events:**
- `onChange`: Called when user selects a different period
- `onClick`: Opens dropdown

**Mantine Components:**
- `Select` or custom `Menu`

**Styling:**
```css
.period-button {
  width: 100%;
  padding: 12px 16px;
  background: #1e2433;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-weight: 600;
}

.period-button:hover {
  border-color: #00d4ff;
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
}
```

---

#### `Navigation`
Navigation menu with grouped sections.

**Props:**
```typescript
interface NavigationProps {
  currentRoute: string;
  notificationCounts?: {
    [key: string]: number;
  };
  onNavigate: (route: string) => void;
}
```

**Navigation Structure:**
```typescript
const navigationSections = [
  {
    title: 'Overview',
    items: [
      { icon: '📊', label: 'Dashboard', route: '/dashboard' },
      { icon: '💳', label: 'Transactions', route: '/transactions', badge: 'count' },
    ],
  },
  {
    title: 'Management',
    items: [
      { icon: '💰', label: 'Monthly Budget', route: '/budget' },
      { icon: '🏦', label: 'Accounts', route: '/accounts' },
      { icon: '🏷️', label: 'Categories', route: '/categories' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { icon: '📈', label: 'Reports', route: '/reports' },
      { icon: '🎯', label: 'Goals', route: '/goals' },
      { icon: '📅', label: 'Recurring', route: '/recurring' },
    ],
  },
  {
    title: 'Other',
    items: [
      { icon: '⚙️', label: 'Settings', route: '/settings' },
      { icon: '❓', label: 'Help & Support', route: '/help' },
    ],
  },
];
```

---

#### `NavItem`
Individual navigation menu item.

**Props:**
```typescript
interface NavItemProps {
  icon: string;
  label: string;
  route: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}
```

**Styling:**
```css
.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #8892a6;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(180, 122, 255, 0.15) 100%);
  color: #00d4ff;
  font-weight: 600;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  width: 3px;
  height: 60%;
  background: linear-gradient(180deg, #00d4ff 0%, #b47aff 100%);
  border-radius: 0 2px 2px 0;
}
```

---

#### `UserMenu`
User profile section with dropdown menu.

**Props:**
```typescript
interface UserMenuProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
  onSettings: () => void;
  onProfile: () => void;
}
```

**State:**
```typescript
const [isOpen, setIsOpen] = useState(false);
```

**Events:**
- `onClick`: Opens dropdown menu
- `onLogout`: Logs out user
- `onSettings`: Navigates to settings
- `onProfile`: Navigates to profile

**Mantine Components:**
- `Menu`
- `Avatar`

---

#### `BottomNavigation` (Mobile)
Bottom navigation bar for mobile devices.

**Props:**
```typescript
interface BottomNavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}
```

**Items:**
```typescript
const bottomNavItems = [
  { icon: '📊', label: 'Dashboard', route: '/dashboard' },
  { icon: '💳', label: 'Transactions', route: '/transactions' },
  { icon: '💰', label: 'Budget', route: '/budget' },
  { icon: '🏦', label: 'Accounts', route: '/accounts' },
  { icon: '⋯', label: 'More', route: '/more' },
];
```

**Styling:**
```css
position: fixed;
bottom: 0;
left: 0;
right: 0;
background: rgba(18, 23, 32, 0.95);
backdrop-filter: blur(20px);
border-top: 1px solid rgba(255, 255, 255, 0.06);
padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
z-index: 100;
```

---

### 2. Dashboard Page Components

#### `DashboardPage`
Main dashboard container.

**Props:**
```typescript
interface DashboardPageProps {
  period: BudgetPeriod;
}
```

**State (via TanStack Query):**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['dashboard', period.id],
  queryFn: () => fetchDashboardData(period.id),
});
```

**API Endpoint:**
```typescript
GET /api/dashboard?period_id={period.id}
Response: DashboardData
```

---

#### `StatCard`
Dashboard statistic card.

**Props:**
```typescript
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  meta?: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
    positive: boolean;
  };
  featured?: boolean;
  loading?: boolean;
  onClick?: () => void;
}
```

**Styling:**
```css
.stat-card {
  background: #151b26;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
}

.stat-card.featured {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(180, 122, 255, 0.08) 100%);
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.stat-card.featured .stat-value {
  font-size: 48px;
  background: linear-gradient(135deg, #00d4ff 0%, #b47aff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**Mantine Components:**
- `Card`
- `Text`
- `Group`
- `Skeleton` (for loading state)

---

#### `BalanceOverTimeChart`
Line chart showing account balances over time.

**Props:**
```typescript
interface BalanceOverTimeChartProps {
  data: BudgetPerDay[];
  loading?: boolean;
  height?: number;
}
```

**Chart Library:**
- Chart.js (already used in designs)
- Or Recharts (better React integration)

**Configuration:**
```typescript
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(21, 27, 38, 0.95)',
      titleColor: '#8892a6',
      bodyColor: '#ffffff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#5a6272', font: { size: 11 } },
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.03)' },
      ticks: { color: '#5a6272', font: { size: 11 } },
    },
  },
};
```

---

#### `TopCategoriesChart`
Horizontal bar chart showing top spending categories.

**Props:**
```typescript
interface TopCategoriesChartProps {
  data: SpentPerCategory[];
  loading?: boolean;
}
```

**Events:**
- `onClick`: Navigate to category detail or filter transactions by category

---

#### `RecentActivityTable`
Table showing recent transactions.

**Props:**
```typescript
interface RecentActivityTableProps {
  transactions: TransactionResponse[];
  loading?: boolean;
  onViewAll: () => void;
  onTransactionClick: (transaction: TransactionResponse) => void;
}
```

**Mantine Components:**
- `Table`
- `ScrollArea`
- `ActionIcon`

---

### 3. Transactions Page Components

#### `TransactionsPage`
Main transactions container.

**Props:**
```typescript
interface TransactionsPageProps {
  period: BudgetPeriod;
}
```

**State (via TanStack Query):**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['transactions', period.id, filters],
  queryFn: () => fetchTransactions(period.id, filters),
});

const [filters, setFilters] = useState<TransactionFilters>({
  type: 'all',
  accountId: null,
  categoryId: null,
  dateRange: null,
  searchQuery: '',
});
```

**API Endpoints:**
```typescript
GET /api/transactions?period_id={period.id}&filters={filters}
POST /api/transactions
PUT /api/transactions/{id}
DELETE /api/transactions/{id}
```

---

#### `QuickAddForm`
Inline form for rapidly adding transactions.

**Props:**
```typescript
interface QuickAddFormProps {
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  vendors: Vendor[];
  onSubmit: (transaction: TransactionRequest) => Promise<void>;
  defaultDate?: string;
  recentTransactions?: TransactionResponse[];
}
```

**State:**
```typescript
const [formData, setFormData] = useState<Transaction>({
  description: '',
  amount: 0,
  occurred_at: new Date().toISOString(),
  transaction_type: 'Outgoing',
  category: undefined,
  from_account: undefined,
  to_account: undefined,
  vendor: undefined,
});

const [isSubmitting, setIsSubmitting] = useState(false);
```

**Events:**
- `onSubmit`: Submits transaction (Ctrl+Enter or click submit)
- `onChange`: Updates form field
- `onSuggestionClick`: Pre-fills form with recent transaction data
- `onClear`: Clears form after submission

**Validation Rules:**
```typescript
const validationSchema = {
  description: { required: true, minLength: 1, maxLength: 255 },
  amount: { required: true, min: 0.01 },
  occurred_at: { required: true, format: 'date' },
  from_account: { required: true },
  category: { required: true },
  // vendor is optional
  // to_account required only if transaction_type === 'Transfer'
};
```

**Mantine Components:**
- `TextInput`
- `NumberInput`
- `DateInput`
- `Select`
- `Button`
- `Group`

**Keyboard Shortcuts:**
```typescript
- Tab: Move to next field
- Shift+Tab: Move to previous field
- Ctrl+Enter: Submit form
- Escape: Clear form
```

---

#### `SuggestionChips`
Quick-fill buttons based on recent transactions.

**Props:**
```typescript
interface SuggestionChipsProps {
  suggestions: Array<{
    vendor: string;
    amount: number;
    category: CategoryResponse;
  }>;
  onSelect: (suggestion: {
    vendor: string;
    amount: number;
    category: CategoryResponse;
  }) => void;
}
```

**Styling:**
```css
.suggestion-chip {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-chip:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
  transform: translateY(-1px);
}
```

---

#### `FiltersBar`
Transaction filters with tabs and quick filters.

**Props:**
```typescript
interface FiltersBarProps {
  filters: TransactionFilters;
  accounts: AccountResponse[];
  categories: CategoryResponse[];
  onFilterChange: (filters: Partial<TransactionFilters>) => void;
}
```

**State:**
```typescript
const [activeTab, setActiveTab] = useState<'all' | 'incoming' | 'outgoing' | 'transfer'>('all');
const [activeFilters, setActiveFilters] = useState<string[]>([]);
```

**Mantine Components:**
- `Tabs`
- `MultiSelect`
- `DateRangePicker`
- `Group`

---

#### `TransactionRow`
Individual transaction row in table.

**Props:**
```typescript
interface TransactionRowProps {
  transaction: TransactionResponse;
  onEdit: (transaction: TransactionResponse) => void;
  onDelete: (id: string) => void;
  onClick?: (transaction: TransactionResponse) => void;
}
```

**State:**
```typescript
const [isHovered, setIsHovered] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
```

**Events:**
- `onClick`: Opens transaction detail modal
- `onEdit`: Opens edit modal
- `onDelete`: Deletes transaction (with confirmation)

**Styling:**
```css
.transaction-row {
  padding: 24px 32px;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

.transaction-row:hover {
  background: rgba(255, 255, 255, 0.02);
  border-bottom-color: rgba(255, 255, 255, 0.06);
}
```

---

### 4. Budget Page Components

#### `BudgetPage`
Main budget management container.

**Props:**
```typescript
interface BudgetPageProps {
  period: BudgetPeriod;
}
```

**State (via TanStack Query):**
```typescript
const { data: budgetCategories, isLoading } = useQuery({
  queryKey: ['budget-categories', period.id],
  queryFn: () => fetchBudgetCategories(period.id),
});

const { mutate: updateBudget } = useMutation({
  mutationFn: (data: BudgetCategoryRequest) => updateBudgetCategory(data),
  onSuccess: () => {
    queryClient.invalidateQueries(['budget-categories']);
  },
});
```

**API Endpoints:**
```typescript
GET /api/budgets/{period_id}/categories
POST /api/budgets/{period_id}/categories
PUT /api/budgets/{period_id}/categories/{id}
DELETE /api/budgets/{period_id}/categories/{id}
```

---

#### `BudgetAllocationChart`
Donut chart showing budget distribution.

**Props:**
```typescript
interface BudgetAllocationChartProps {
  categories: BudgetCategoryResponse[];
  loading?: boolean;
}
```

**Chart Configuration:**
```typescript
const chartOptions = {
  type: 'doughnut',
  cutout: '75%',
  plugins: {
    legend: { display: false },
  },
};
```

---

#### `CategoryBudgetItem`
Individual budget category with progress bar.

**Props:**
```typescript
interface CategoryBudgetItemProps {
  category: BudgetCategoryResponse;
  spent: number;
  onEdit: (category: BudgetCategoryResponse) => void;
  onDelete: (id: string) => void;
}
```

**State:**
```typescript
const [isEditing, setIsEditing] = useState(false);
const [budgetValue, setBudgetValue] = useState(category.budgeted_value);
```

**Events:**
- `onEdit`: Inline edit budget amount
- `onDelete`: Remove category from budget
- `onSave`: Save updated budget amount

**Computed Values:**
```typescript
const percentage = (spent / category.budgeted_value) * 100;
const remaining = category.budgeted_value - spent;
const status = percentage > 100 ? 'over' : percentage > 85 ? 'warning' : 'success';
```

**Styling:**
```css
.progress-bar {
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-bar-fill.success {
  background: linear-gradient(90deg, #00ffa3 0%, #33ffb8 100%);
}

.progress-bar-fill.warning {
  background: linear-gradient(90deg, #ffa940 0%, #ffbd6b 100%);
}

.progress-bar-fill.danger {
  background: linear-gradient(90deg, #ff6b9d 0%, #ff8fb3 100%);
}
```

---

### 5. Accounts Page Components

#### `AccountsPage`
Main accounts management container.

**Props:**
```typescript
interface AccountsPageProps {
  period: BudgetPeriod;
}
```

**State (via TanStack Query):**
```typescript
const { data: accounts, isLoading } = useQuery({
  queryKey: ['accounts'],
  queryFn: () => fetchAccounts(),
});
```

**API Endpoints:**
```typescript
GET /api/accounts
POST /api/accounts
PUT /api/accounts/{id}
DELETE /api/accounts/{id}
```

---

#### `AccountCard`
Individual account card with balance and stats.

**Props:**
```typescript
interface AccountCardProps {
  account: AccountResponse;
  balanceHistory: BudgetPerDay[];
  monthlySpent: number;
  transactionCount: number;
  onEdit: (account: AccountResponse) => void;
  onDelete: (id: string) => void;
  onViewDetails: (account: AccountResponse) => void;
}
```

**Computed Values:**
```typescript
const balanceChange = balanceHistory[balanceHistory.length - 1].balance - 
                      balanceHistory[0].balance;
const changePercentage = (balanceChange / balanceHistory[0].balance) * 100;
const isPositive = balanceChange >= 0;

// For credit cards
const availableCredit = account.spend_limit ? 
  account.spend_limit - Math.abs(account.balance) : null;
const utilizationPercentage = account.spend_limit ?
  (Math.abs(account.balance) / account.spend_limit) * 100 : null;
```

**Mantine Components:**
- `Card`
- `Text`
- `Group`
- `ActionIcon`
- `Menu`

---

#### `AccountSparkline`
Mini line chart showing balance trend.

**Props:**
```typescript
interface AccountSparklineProps {
  data: BudgetPerDay[];
  color: string;
  height?: number;
}
```

---

### 6. Categories Page Components

#### `CategoriesPage`
Main categories management container.

**Props:**
```typescript
interface CategoriesPageProps {}
```

**State (via TanStack Query):**
```typescript
const { data: categories, isLoading } = useQuery({
  queryKey: ['categories'],
  queryFn: () => fetchCategories(),
});

const [filterType, setFilterType] = useState<CategoryType | 'all'>('all');
```

**API Endpoints:**
```typescript
GET /api/categories
POST /api/categories
PUT /api/categories/{id}
DELETE /api/categories/{id}
```

---

#### `CategoryCard`
Individual category card with spending stats.

**Props:**
```typescript
interface CategoryCardProps {
  category: CategoryResponse;
  monthlySpent: number;
  transactionCount: number;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  onEdit: (category: CategoryResponse) => void;
  onDelete: (id: string) => void;
  onClick: (category: CategoryResponse) => void;
}
```

**Styling:**
```css
.category-card {
  background: #151b26;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--category-color);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover::before {
  opacity: 1;
}
```

---

### 7. Shared Components

#### `Button`
Reusable button component.

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}
```

**Variants:**
```css
.button-primary {
  background: linear-gradient(135deg, #00d4ff 0%, #b47aff 100%);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 212, 255, 0.3);
}

.button-secondary {
  background: #151b26;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.button-ghost {
  background: transparent;
  color: #8892a6;
}

.button-danger {
  background: #ff6b9d;
  color: #ffffff;
}
```

**Mantine Component:**
- `Button` (extend with custom styles)

---

#### `Badge`
Small label for categories, status, etc.

**Props:**
```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'xs' | 'sm' | 'md';
  icon?: string;
  children: React.ReactNode;
}
```

**Mantine Component:**
- `Badge`

---

#### `Modal`
Reusable modal component.

**Props:**
```typescript
interface ModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}
```

**Mantine Component:**
- `Modal`

---

#### `EmptyState`
Empty state placeholder.

**Props:**
```typescript
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Styling:**
```css
.empty-state {
  padding: 64px 32px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #8892a6;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #5a6272;
}
```

---

## Data Models & API

### Additional/Modified Models

#### `TransactionFilters`
```typescript
export interface TransactionFilters {
  type: 'all' | 'incoming' | 'outgoing' | 'transfer';
  accountId: string | null;
  categoryId: string | null;
  dateRange: { start: string; end: string } | null;
  searchQuery: string;
  vendorId: string | null;
}
```

#### `DashboardStats`
```typescript
export interface DashboardStats {
  totalAssets: number;
  remainingBudget: number;
  budgetLimit: number;
  avgDailySpend: number;
  monthProgress: number;
  daysUntilReset: number;
}
```

#### `AccountWithStats`
```typescript
export interface AccountWithStats extends AccountResponse {
  monthlySpent: number;
  transactionCount: number;
  balanceChange: number;
  balanceChangePercentage: number;
  balanceHistory: BudgetPerDay[];
}
```

#### `CategoryWithStats`
```typescript
export interface CategoryWithStats extends CategoryResponse {
  monthlySpent: number;
  transactionCount: number;
  trend: {
    direction: 'up' | 'down';
    percentage: number;
  };
}
```

### API Endpoints Summary

```typescript
// Dashboard
GET /api/dashboard?period_id={id}

// Transactions
GET /api/transactions?period_id={id}&filters={...}
POST /api/transactions
PUT /api/transactions/{id}
DELETE /api/transactions/{id}

// Accounts
GET /api/accounts
GET /api/accounts/{id}/history?period_id={id}
POST /api/accounts
PUT /api/accounts/{id}
DELETE /api/accounts/{id}

// Categories
GET /api/categories
GET /api/categories/{id}/stats?period_id={id}
POST /api/categories
PUT /api/categories/{id}
DELETE /api/categories/{id}

// Budget
GET /api/budgets/{period_id}/categories
POST /api/budgets/{period_id}/categories
PUT /api/budgets/{period_id}/categories/{id}
DELETE /api/budgets/{period_id}/categories/{id}

// Periods
GET /api/periods
GET /api/periods/{id}
POST /api/periods
PUT /api/periods/{id}
DELETE /api/periods/{id}

// Vendors
GET /api/vendors
POST /api/vendors

// Auth
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET /api/auth/me
```

---

## Routing Structure

```typescript
const routes = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/transactions', element: <TransactionsPage /> },
      { path: '/budget', element: <BudgetPage /> },
      { path: '/accounts', element: <AccountsPage /> },
      { path: '/accounts/:id', element: <AccountDetailPage /> },
      { path: '/categories', element: <CategoriesPage /> },
      { path: '/categories/:id', element: <CategoryDetailPage /> },
      { path: '/reports', element: <ReportsPage /> },
      { path: '/goals', element: <GoalsPage /> },
      { path: '/recurring', element: <RecurringPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/help', element: <HelpPage /> },
      { path: '/more', element: <MorePage /> }, // Mobile menu
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: '/auth/login', element: <LoginPage /> },
      { path: '/auth/register', element: <RegisterPage /> },
      { path: '/auth/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
];
```

---

## State Management

### Global State (TanStack Query)

```typescript
// queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

// Query Keys
export const queryKeys = {
  dashboard: (periodId: string) => ['dashboard', periodId],
  transactions: (periodId: string, filters: TransactionFilters) => 
    ['transactions', periodId, filters],
  accounts: () => ['accounts'],
  accountHistory: (accountId: string, periodId: string) => 
    ['account-history', accountId, periodId],
  categories: () => ['categories'],
  categoryStats: (categoryId: string, periodId: string) => 
    ['category-stats', categoryId, periodId],
  budgetCategories: (periodId: string) => ['budget-categories', periodId],
  periods: () => ['periods'],
  vendors: () => ['vendors'],
  user: () => ['user'],
};
```

### Custom Hooks

```typescript
// useDashboard.ts
export const useDashboard = (periodId: string) => {
  return useQuery({
    queryKey: queryKeys.dashboard(periodId),
    queryFn: () => api.getDashboardData(periodId),
  });
};

// useTransactions.ts
export const useTransactions = (
  periodId: string, 
  filters: TransactionFilters
) => {
  return useQuery({
    queryKey: queryKeys.transactions(periodId, filters),
    queryFn: () => api.getTransactions(periodId, filters),
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TransactionRequest) => api.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransactionRequest> }) =>
      api.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// useAccounts.ts
export const useAccounts = () => {
  return useQuery({
    queryKey: queryKeys.accounts(),
    queryFn: () => api.getAccounts(),
  });
};

// useCategories.ts
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => api.getCategories(),
  });
};

// usePeriod.ts
export const usePeriod = () => {
  const [currentPeriod, setCurrentPeriod] = useState<BudgetPeriod | null>(null);
  
  const { data: periods } = useQuery({
    queryKey: queryKeys.periods(),
    queryFn: () => api.getPeriods(),
  });
  
  useEffect(() => {
    if (periods && periods.length > 0 && !currentPeriod) {
      // Set current period to the one that includes today
      const today = new Date().toISOString().split('T')[0];
      const current = periods.find(p => 
        p.start_date <= today && p.end_date >= today
      );
      setCurrentPeriod(current || periods[0]);
    }
  }, [periods, currentPeriod]);
  
  return {
    currentPeriod,
    periods: periods || [],
    setCurrentPeriod,
  };
};

// useAuth.ts
export const useAuth = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.user(),
    queryFn: () => api.getCurrentUser(),
  });
  
  const loginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
  
  const logoutMutation = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
  };
};
```

---

## Real-time Updates

### WebSocket Integration

```typescript
// websocket.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: 'transaction.created' | 'transaction.updated' | 'transaction.deleted' |
        'account.updated' | 'budget.updated';
  data: any;
}

export const useWebSocket = (userId: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const ws = new WebSocket(`${process.env.WS_URL}/ws/${userId}`);
    
    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'transaction.created':
        case 'transaction.updated':
        case 'transaction.deleted':
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['accounts'] });
          break;
          
        case 'account.updated':
          queryClient.invalidateQueries({ queryKey: ['accounts'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          break;
          
        case 'budget.updated':
          queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          break;
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      ws.close();
    };
  }, [userId, queryClient]);
};
```

### Optimistic Updates

```typescript
// Example: Optimistic transaction creation
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TransactionRequest) => api.createTransaction(data),
    
    // Optimistically update the cache before the request completes
    onMutate: async (newTransaction) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      
      // Snapshot previous value
      const previousTransactions = queryClient.getQueryData(['transactions']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['transactions'], (old: any) => {
        return {
          ...old,
          data: [
            {
              id: 'temp-' + Date.now(),
              ...newTransaction,
              // Add related objects
            },
            ...old.data,
          ],
        };
      });
      
      return { previousTransactions };
    },
    
    // If mutation fails, rollback
    onError: (err, newTransaction, context) => {
      queryClient.setQueryData(
        ['transactions'],
        context?.previousTransactions
      );
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
```

---

## Validation Rules

### Transaction Validation
```typescript
export const transactionValidation = {
  description: {
    required: true,
    minLength: 1,
    maxLength: 255,
    message: 'Description is required (max 255 characters)',
  },
  amount: {
    required: true,
    min: 0.01,
    message: 'Amount must be greater than 0',
  },
  occurred_at: {
    required: true,
    format: 'date',
    message: 'Valid date is required',
  },
  from_account_id: {
    required: true,
    message: 'Account is required',
  },
  category_id: {
    required: true,
    message: 'Category is required',
  },
  to_account_id: {
    required: (data: TransactionRequest) => data.transaction_type === 'Transfer',
    message: 'Destination account is required for transfers',
  },
};
```

### Account Validation
```typescript
export const accountValidation = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: 'Account name is required (max 100 characters)',
  },
  account_type: {
    required: true,
    enum: ACCOUNT_TYPES,
    message: 'Valid account type is required',
  },
  balance: {
    required: true,
    message: 'Initial balance is required',
  },
  currency: {
    required: true,
    message: 'Currency is required',
  },
  spend_limit: {
    min: 0,
    message: 'Spend limit must be positive',
  },
};
```

### Category Validation
```typescript
export const categoryValidation = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: 'Category name is required (max 100 characters)',
  },
  category_type: {
    required: true,
    enum: CATEGORY_TYPES,
    message: 'Valid category type is required',
  },
  color: {
    required: true,
    pattern: /^#[0-9A-F]{6}$/i,
    message: 'Valid hex color is required',
  },
};
```

### Budget Validation
```typescript
export const budgetCategoryValidation = {
  category_id: {
    required: true,
    message: 'Category is required',
  },
  budgeted_value: {
    required: true,
    min: 0,
    message: 'Budget amount must be positive',
  },
};
```

---

## Accessibility Requirements

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order should be logical (top to bottom, left to right)
- Focus indicators must be visible
- Escape key should close modals/dropdowns
- Enter/Space should activate buttons

### Screen Reader Support
- All images must have alt text
- All form inputs must have labels
- Use semantic HTML (nav, main, aside, etc.)
- ARIA labels for icon-only buttons
- Live regions for dynamic content updates

### Color Contrast
- Text on background: minimum 4.5:1 ratio
- Interactive elements: minimum 3:1 ratio
- Don't rely solely on color to convey information

### Focus Management
- Modal opens → focus first input
- Modal closes → focus returns to trigger
- Form submits → focus on success message or first error

---

## Performance Optimization

### Code Splitting
```typescript
// Lazy load pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
// etc.
```

### Memoization
```typescript
// Expensive calculations
const totalSpent = useMemo(() => {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}, [transactions]);

// Callbacks
const handleTransactionClick = useCallback((transaction: TransactionResponse) => {
  navigate(`/transactions/${transaction.id}`);
}, [navigate]);
```

### Virtual Scrolling
For large transaction lists (100+ items):
```typescript
import { VirtualScroller } from '@mantine/core';

<VirtualScroller
  height={600}
  itemSize={72} // Height of each transaction row
  totalCount={transactions.length}
  renderItem={(index) => (
    <TransactionRow transaction={transactions[index]} />
  )}
/>
```

### Image Optimization
- Use WebP format with fallbacks
- Lazy load images below fold
- Use appropriate sizes (don't load full-size images for thumbnails)

---

## Testing Requirements

### Unit Tests
- Test all utility functions
- Test custom hooks
- Test validation logic
- Test computed values

### Component Tests
```typescript
// Example: TransactionRow.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionRow } from './TransactionRow';

describe('TransactionRow', () => {
  it('renders transaction data correctly', () => {
    const transaction = {
      id: '1',
      description: 'Test transaction',
      amount: 50.00,
      // ...
    };
    
    render(<TransactionRow transaction={transaction} />);
    
    expect(screen.getByText('Test transaction')).toBeInTheDocument();
    expect(screen.getByText('€ 50.00')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    const transaction = { /* ... */ };
    
    render(<TransactionRow transaction={transaction} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByTitle('Edit'));
    
    expect(onEdit).toHaveBeenCalledWith(transaction);
  });
});
```

### Integration Tests
- Test complete user flows
- Test navigation
- Test form submissions
- Test error handling

### E2E Tests (with Playwright/Cypress)
```typescript
// Example: Transaction creation flow
test('user can create a transaction', async ({ page }) => {
  await page.goto('/transactions');
  
  await page.fill('[name="description"]', 'Lunch');
  await page.fill('[name="amount"]', '15.50');
  await page.selectOption('[name="category"]', 'Comida');
  await page.selectOption('[name="account"]', 'ING');
  
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.transaction-row').first())
    .toContainText('Lunch');
});
```

---

## Error Handling

### API Error Handling
```typescript
// api.ts
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    switch (error.response.status) {
      case 400:
        return { message: 'Invalid request', errors: error.response.data.errors };
      case 401:
        // Redirect to login
        window.location.href = '/auth/login';
        return { message: 'Unauthorized' };
      case 403:
        return { message: 'Access forbidden' };
      case 404:
        return { message: 'Resource not found' };
      case 500:
        return { message: 'Server error. Please try again later.' };
      default:
        return { message: 'An error occurred' };
    }
  } else if (error.request) {
    // Request made but no response
    return { message: 'No response from server. Check your connection.' };
  } else {
    // Error setting up request
    return { message: error.message || 'An error occurred' };
  }
};
```

### User-Facing Error Messages
```typescript
// Show error notifications
import { notifications } from '@mantine/notifications';

const { mutate: createTransaction } = useCreateTransaction();

const handleSubmit = async (data: TransactionRequest) => {
  try {
    await createTransaction(data);
    notifications.show({
      title: 'Success',
      message: 'Transaction created successfully',
      color: 'green',
    });
  } catch (error) {
    const { message, errors } = handleApiError(error);
    notifications.show({
      title: 'Error',
      message,
      color: 'red',
    });
  }
};
```

---

## Storybook Stories

### Example: Button Component
```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    leftIcon: '💰',
    children: 'Add Transaction',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...',
  },
};
```

### Example: TransactionRow Component
```typescript
// TransactionRow.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { TransactionRow } from './TransactionRow';

const meta: Meta<typeof TransactionRow> = {
  title: 'Components/TransactionRow',
  component: TransactionRow,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TransactionRow>;

const mockTransaction = {
  id: '1',
  description: 'Lunch at Restaurant',
  amount: 45.50,
  occurred_at: '2026-01-20',
  transaction_type: 'Outgoing' as const,
  category: {
    id: '1',
    name: 'Comida',
    color: '#b47aff',
    icon: '🍔',
    parent_id: null,
    category_type: 'Outgoing' as const,
  },
  from_account: {
    id: '1',
    name: 'ING',
    color: '#00ffa3',
    icon: '💳',
    account_type: 'Checking' as const,
    currency: {
      id: '1',
      name: 'Euro',
      symbol: '€',
      currency: 'EUR',
      decimal_places: 2,
    },
    balance: 500,
  },
  to_account: null,
  vendor: {
    id: '1',
    name: 'McDonald\'s',
  },
};

export const Default: Story = {
  args: {
    transaction: mockTransaction,
    onEdit: () => console.log('Edit clicked'),
    onDelete: () => console.log('Delete clicked'),
  },
};

export const Transfer: Story = {
  args: {
    transaction: {
      ...mockTransaction,
      transaction_type: 'Transfer',
      to_account: {
        id: '2',
        name: 'Savings',
        color: '#ffa940',
        icon: '💰',
        account_type: 'Savings' as const,
        currency: mockTransaction.from_account.currency,
        balance: 1000,
      },
    },
    onEdit: () => console.log('Edit clicked'),
    onDelete: () => console.log('Delete clicked'),
  },
};
```

---

## Environment Variables

```typescript
// .env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
VITE_APP_NAME=BudgetApp
VITE_ENABLE_MOCK_DATA=false

// .env.production
VITE_API_URL=https://api.budgetapp.com/api
VITE_WS_URL=wss://api.budgetapp.com
VITE_APP_NAME=BudgetApp
VITE_ENABLE_MOCK_DATA=false
```

---

## Build & Deployment

### Build Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

### Browser Support
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari: iOS 14+
- Chrome Android: Last 2 versions

---

## Additional Notes

### Animation Guidelines
- Use `transition: all 0.2s ease` for hover states
- Use `transition: all 0.3s ease` for larger movements
- Use cubic-bezier for progress bars: `cubic-bezier(0.4, 0, 0.2, 1)`
- Stagger animations with delays: `0.1s, 0.2s, 0.3s...`
- Use `@keyframes fadeInUp` for page load animations

### Mobile Considerations
- Touch targets minimum 44x44px
- Swipe gestures for navigation (optional)
- Pull-to-refresh on lists (optional)
- Bottom navigation visible above safe area
- Forms should use appropriate input types (number, date, etc.)
- Consider using `inputMode` for better mobile keyboards

### Progressive Web App (Optional)
- Service worker for offline support
- Manifest.json for install prompt
- Cache API data for offline viewing
- Background sync for pending actions

---

## Questions for Frontend Engineer

Before starting implementation, please clarify:

1. **Mantine Version**: Confirm using Mantine 8.x
2. **React Version**: React 18+?
3. **TypeScript Config**: Strict mode enabled?
4. **Form Library**: Using Mantine form or react-hook-form?
5. **Chart Library**: Chart.js or Recharts preference?
6. **Date Library**: day.js or date-fns?
7. **Icons**: Using emoji or icon library (lucide-react, tabler-icons)?
8. **Currency Formatting**: Using Intl.NumberFormat or library?
9. **WebSocket**: Need mock WebSocket for development?
10. **Mock Data**: Need comprehensive mock data generators?

---

**End of Component Specification**

This document provides a complete blueprint for implementing the budget app redesign. Please refer to this document throughout development and reach out for any clarifications or design decisions.
