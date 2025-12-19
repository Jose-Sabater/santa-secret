import { z } from "zod";
import { createFunctionTool } from "@opperai/agents";

const PRICERUNNER_BASE_URL = "https://api.pricerunner.com";

// Schemas for API responses
const ProductSchema = z.object({
  productIdentifier: z.string(),
  name: z.string(),
  klarnaProductPageUrl: z.string(),
  imageUrl: z.string().optional(),
  brand: z.object({
    name: z.string(),
    logoUrl: z.string().nullable(),
  }).optional(),
  categoryName: z.string().optional(),
});

const OfferSchema = z.object({
  offerName: z.string(),
  merchant: z.object({
    merchantName: z.string(),
    merchantLogoUrl: z.string().nullable(),
  }),
  offerUrl: z.string(),
  price: z.object({
    value: z.string(),
    currency: z.string(),
  }),
  stockStatus: z.string(),
});

// Tool input schemas
const SearchInputSchema = z.object({
  query: z.string().describe("Search query for products (max 100 chars)"),
  market: z.string().default("SE").describe("Market code (SE, DK, NO, etc.)"),
  size: z.number().default(10).describe("Number of results (max 25)"),
});

const OffersInputSchema = z.object({
  productId: z.string().describe("Product identifier from search results"),
  market: z.string().default("SE").describe("Market code (SE, DK, NO, etc.)"),
});

// API functions
export async function searchProducts(input: z.infer<typeof SearchInputSchema>) {
  const { query, market, size } = input;
  const apiKey = process.env.KLARNA_API_KEY;

  if (!apiKey) {
    throw new Error("KLARNA_API_KEY not set");
  }

  const url = `${PRICERUNNER_BASE_URL}/agentic/v1/product/search/${market}`;
  const params = new URLSearchParams({
    q: query.slice(0, 100),
    size: String(Math.min(size, 25)),
  });

  const response = await fetch(`${url}?${params}`, {
    headers: { tokenId: apiKey },
  });

  if (!response.ok) {
    throw new Error(`PriceRunner search failed: ${response.status}`);
  }

  const data = await response.json();

  return {
    totalHits: data.totalNumberOfHits,
    products: data.products.map((p: any) => ({
      productId: p.productIdentifier,
      name: p.name,
      brand: p.brand?.name,
      imageUrl: p.imageUrl,
      pricerunnerUrl: p.klarnaProductPageUrl,
      category: p.categoryName,
    })),
  };
}

export async function getOffers(input: z.infer<typeof OffersInputSchema>) {
  const { productId, market } = input;
  const apiKey = process.env.KLARNA_API_KEY;

  if (!apiKey) {
    throw new Error("KLARNA_API_KEY not set");
  }

  const url = `${PRICERUNNER_BASE_URL}/agentic/v1/product/offers/${market}`;
  const params = new URLSearchParams({
    productIdentifiers: productId,
  });

  const response = await fetch(`${url}?${params}`, {
    headers: { tokenId: apiKey },
  });

  if (!response.ok) {
    throw new Error(`PriceRunner offers failed: ${response.status}`);
  }

  const data = await response.json();
  const listing = data.productListings?.[0];

  if (!listing) {
    return { product: null, offers: [] };
  }

  // Calculate price range from offers
  const prices = listing.offers
    .map((o: any) => parseFloat(o.price.value))
    .filter((p: number) => !isNaN(p));

  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
  const currency = listing.offers[0]?.price?.currency || "SEK";

  return {
    product: {
      productId: listing.product.productIdentifier,
      name: listing.product.name,
      brand: listing.product.brand?.name,
      imageUrl: listing.product.imageUrl,
      pricerunnerUrl: listing.product.klarnaProductPageUrl,
      rating: listing.product.rating,
      category: listing.product.categoryName,
    },
    priceRange: minPrice !== null ? { min: minPrice, max: maxPrice, currency } : null,
    offers: listing.offers.slice(0, 5).map((o: any) => ({
      merchant: o.merchant.merchantName,
      price: `${o.price.value} ${o.price.currency}`,
      inStock: o.stockStatus === "IN_STOCK",
      url: o.offerUrl,
    })),
  };
}

// Create tools for the agent
export const searchProductsTool = createFunctionTool(
  searchProducts,
  {
    name: "searchProducts",
    description: "Search for products on PriceRunner. Returns product names, images, and IDs. Use this to find gift options based on keywords.",
    schema: SearchInputSchema,
  }
);

export const getOffersTool = createFunctionTool(
  getOffers,
  {
    name: "getOffers",
    description: "Get price offers for a specific product. Returns prices from different merchants, stock status, and buy links. Use this after searching to get actual prices.",
    schema: OffersInputSchema,
  }
);
