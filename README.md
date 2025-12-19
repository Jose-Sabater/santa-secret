# Santa's Wish Helper

AI-powered Secret Santa gift finder using Klarna/PriceRunner API and Opper AI.

## Setup

### Environment Variables

Create a `.env` file:
```bash
KLARNA_API_KEY=your-klarna-api-key
OPPER_API_KEY=your-opper-api-key
```

### Install Dependencies

```bash
npm install
```

### Running the App

**Backend (Express + Opper AI Agent):**
```bash
export OPPER_API_KEY="your-opper-api-key"
npm run server
```
Runs on http://localhost:3001

**Frontend (Vite + React):**
```bash
npm run dev
```
Runs on http://localhost:8080

**Both together:**
```bash
export OPPER_API_KEY="your-opper-api-key"
npm run dev:full
```

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Klarna/PriceRunner API for product search
- Opper AI for intelligent gift recommendations

---

## PriceRunner API

Python CLI for testing the PriceRunner Agentic API.

### Setup

Requires `.env` file with:
```
KLARNA_API_KEY=your-api-key
```

### API Endpoints

#### 1. Search (`/agentic/v1/product/search/{market}`)

**Purpose:** Find products by keyword search.

**Returns:**
- `productIdentifier` - unique ID needed for offers endpoint
- `name` - product name
- `brand` - manufacturer
- `categoryName` - product category
- `imageUrl` - product image
- `klarnaProductPageUrl` - link to PriceRunner page

**Does NOT return:** Prices, merchants, stock status

**API Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `market` | Yes (path) | Country code: SE, DK, NO, etc. |
| `q` | Yes | Search query (max 100 chars) |
| `tokenId` | Yes (header) | API key |
| `size` | No | Results count (max 25) |
| `offset` | No | Pagination offset |
| `sortOrders` | No | POPULARITY, NAME, RATING, TREND, HOT |

#### 2. Offers (`/agentic/v1/product/offers/{market}`)

**Purpose:** Get actual prices and merchant listings for specific products.

**Returns:**
- `product` - full product details with attributes (specs, ratings, GTINs)
- `offers[]` - list of merchant offers, each with:
  - `merchant` - store name, logo
  - `price` - actual price + currency
  - `shippingCost` - delivery cost
  - `stockStatus` - IN_STOCK, BACKORDER, etc.
  - `deliveryTime` - min/max days
  - `offerUrl` - link to buy
  - `paymentMethods` - accepted payment options

**API Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `market` | Yes (path) | Country code |
| `productIdentifiers` | Yes | Product ID(s) from search |
| `tokenId` | Yes (header) | API key |
| `minPrice` | No | Filter by minimum price |
| `maxPrice` | No | Filter by maximum price |
| `itemConditionFilters` | No | NEW, UNKNOWN (default: both) |

### CLI Usage

```bash
# Search for products
uv run pricerunner.py search --market SE --query "iphone 15" --size 10

# Get prices for a product
uv run pricerunner.py offers --market SE --product-ids "krn:kpdc:product:3405418937"
```
