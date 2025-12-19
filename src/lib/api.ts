import { GiftItem } from "@/components/GiftCard";

const API_BASE = "/api";

export interface PersonDescription {
  name: string;
  description: string;
  interests: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ChatOptions {
  market?: string;
  minPrice?: number;
  maxPrice?: number;
  numSuggestions?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  products?: GiftItem[];
}

export interface ChatResponse {
  message: string;
  products?: Array<{
    productId: string;
    name: string;
    brand?: string;
    imageUrl?: string;
    pricerunnerUrl: string;
    price?: {
      min: number;
      max: number;
      currency: string;
    };
    reasoning: string;
  }>;
  needsMoreInfo?: boolean;
}

/**
 * Send a chat message to the gift finder agent
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = [],
  options: ChatOptions = {}
): Promise<ChatResponse> {
  const { market = "SE", minPrice, maxPrice, numSuggestions = 5 } = options;

  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, market, minPrice, maxPrice, numSuggestions }),
  });

  if (!response.ok) {
    throw new Error(`Chat failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get gift suggestions from the agent based on person description
 */
export async function getGiftSuggestions(person: PersonDescription): Promise<GiftItem[]> {
  // Build a natural language message from the form data
  let message = `I need gift ideas for ${person.name || "someone special"}.`;

  if (person.description) {
    message += ` Here's what I know about them: ${person.description}`;
  }

  if (person.interests) {
    message += ` They're interested in: ${person.interests}`;
  }

  const response = await sendChatMessage(message);

  // Transform agent response to GiftItem format
  return (response.products || []).map((p) => ({
    id: p.productId,
    name: p.name,
    description: p.reasoning,
    price: p.price ? `${p.price.min.toLocaleString()} - ${p.price.max.toLocaleString()} ${p.price.currency}` : undefined,
    imageUrl: p.imageUrl,
    link: p.pricerunnerUrl,
    reason: p.reasoning,
    brand: p.brand,
  }));
}

/**
 * Direct search for products (bypasses agent)
 */
export async function searchItems(query: string, market: string = "SE"): Promise<GiftItem[]> {
  const response = await fetch(
    `${API_BASE}/search?q=${encodeURIComponent(query)}&size=10&market=${market}`
  );

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  const data = await response.json();

  // Transform search results to GiftItem format
  return data.products.map((p: any) => ({
    id: p.productId,
    name: p.name,
    description: p.category || "Product",
    imageUrl: p.imageUrl,
    link: p.pricerunnerUrl,
    brand: p.brand,
  }));
}

/**
 * Get offers/prices for a specific product
 */
export async function getProductOffers(productId: string) {
  const response = await fetch(
    `${API_BASE}/offers?productId=${encodeURIComponent(productId)}`
  );

  if (!response.ok) {
    throw new Error(`Offers failed: ${response.status}`);
  }

  return response.json();
}
