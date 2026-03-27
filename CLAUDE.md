# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LCG Finance** — a single-page financial management app for "Law Council Group", built as a single self-contained `index.html` file. No build system, no package manager, no server-side code.

**To run:** open `index.html` in a browser, or serve locally:
```bash
python -m http.server 8000
# or
npx http-server
```

## Architecture

The entire application lives in `index.html` (~62KB). All HTML, CSS, and JavaScript are in one file. The UI is in Russian (Cyrillic).

**Backend:** Firebase 10.12.2 (CDN-loaded)
- Firestore: primary data store, real-time sync via `onSnapshot`
- Firebase Auth: Google Sign-In only
- Data path: collection `lcg-finance` / document `shared-data`

**Auth model:** single admin (`batyrkhandt@gmail.com`) has full CRUD; all other authenticated users are read-only viewers. Admin-only elements use CSS class `.admin-only`.

## Core Data Model (`S` object)

```javascript
S = {
  transactions: [],   // all financial transactions
  invoices: [],       // invoices with status tracking
  plans: {},          // monthly revenue plans keyed by "YYYY-MM"
  settings: {
    taxIP: 10,        // tax % for "ИП LCG"
    taxTOO: 20,       // tax % for "ТОО LCG"
    erbol: 80,        // founder distribution parameter
    ramadan: 20,      // founder distribution parameter
    requisites: ''
  },
  currentCompany: 'ИП LCG',
  theme: 'light'
}
```

## Key Functions

| Function | Purpose |
|---|---|
| `save()` | Persist `S` to Firestore |
| `loadDB()` | Initial load from Firestore on startup |
| `startSync()` | Attach real-time Firestore listener |
| `R()` | Re-render all active UI components |
| `fTxs()` | Filter transactions by year/company |
| `calcP(txs)` | Compute revenue/expense/profit metrics |
| `eC(txs)` | Group expenses by category |
| `saveTx()` | Create or update a transaction |
| `saveInv()` | Create an invoice |
| `importFromExcel()` | Parse `.xlsx` files via SheetJS |
| `importFromGoogleSheets()` | Import from Google Sheets CSV export URL |
| `expJ()` / `impJ()` | JSON backup export/import |

## Pages (7 total)

Pages are shown/hidden via `id` selectors: `p-dashboard`, `p-tx`, `p-inv`, `p-pnl`, `p-plan`, `p-found`, `p-set`.

- **Dashboard** (`p-dashboard`): KPI cards, recent transactions, expense breakdown
- **Transactions** (`p-tx`): full transaction list with month/category/type filters
- **Invoices** (`p-inv`): invoice tracking, print, mark-as-paid
- **P&L** (`p-pnl`): monthly profit & loss by company
- **Plan** (`p-plan`): revenue planning vs. actuals
- **Founders** (`p-found`): tax calculations and profit distribution between founders
- **Settings** (`p-set`): admin-only; tax rates, requisites, import/export, DB clear

## Dual-Company Accounting

All transactions belong to either `ИП LCG` or `ТОО LCG`. Most views respect `S.currentCompany` for filtering. Tax rates differ per entity (`taxIP` vs `taxTOO`). The Founders page calculates net distribution across both entities.

## Theming

Light/dark mode via CSS custom properties. Theme stored in `localStorage` key `lcg-th`.

## Data Files

- `DDS_ChK_February_2026.xlsx` — example Excel file for import (February 2026 cash flow data)
