# Santa's Wish Helper - Implementation Plan

## Overview
AI-powered Secret Santa gift finder with multi-turn conversation using:
- **@opperai/agents** - Agent SDK for conversational gift finding
- **PriceRunner API** - Product search and pricing
- **React + Vite** - Frontend (already exists)
- **Express.js** - Simple API server

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React + Vite + Tailwind + shadcn/ui                        │
│  - Chat UI for multi-turn conversation                       │
│  - Gift cards with real prices/images                        │
│  - Direct search mode (bypasses agent)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Express Server                          │
│  POST /api/chat     - Multi-turn gift conversation          │
│  GET  /api/search   - Direct product search                 │
│  GET  /api/offers   - Get prices for product                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Opper Agent SDK                          │
│  GiftFinderAgent with tools:                                │
│  - searchProducts(query) → PriceRunner search               │
│  - getOffers(productId) → PriceRunner offers/prices         │
│  - Memory of conversation for refinement                    │
└─────────────────────────────────────────────────────────────┘
```

## Files to Create/Modify

### Backend (new)
- `server/index.ts` - Express server entry point
- `server/agent.ts` - GiftFinderAgent definition with tools
- `server/tools/pricerunner.ts` - PriceRunner API tools (search, offers)
- `server/routes/chat.ts` - Chat endpoint (streams responses)
- `server/routes/search.ts` - Direct search endpoint

### Frontend (modify existing)
- `src/lib/api.ts` - Connect to real backend
- `src/pages/Index.tsx` - Add chat UI for multi-turn mode
- `src/components/ChatMessage.tsx` - New: chat bubbles (user/assistant)
- `src/components/ChatInput.tsx` - New: chat input with history
- `src/components/ProductCard.tsx` - New: rich product preview in chat
  - Product image (from API `imageUrl`)
  - Product name + brand
  - Price range (from offers)
  - "View on PriceRunner" link (from API `klarnaProductPageUrl`)
  - AI reasoning for why this gift matches

### Config
- `package.json` - Add server deps (@opperai/agents, express, cors)
- `.env` - Add OPPER_API_KEY alongside KLARNA_API_KEY

## Implementation Steps

### Phase 1: Backend Setup
1. Create `server/` directory structure
2. Set up Express server with CORS
3. Port PriceRunner API calls from Python to TypeScript
4. Create tools using `createFunctionTool` from @opperai/agents

### Phase 2: Gift Finder Agent
1. Define GiftFinderAgent with:
   - Instructions for gift recommendation
   - `searchProducts` tool - searches PriceRunner
   - `getOffers` tool - gets prices for specific products
   - Output schema for structured gift suggestions
2. Add conversation memory (messages array)
3. Implement streaming for real-time responses

### Phase 3: API Routes
1. POST `/api/chat` - accepts messages, returns agent response (streaming)
2. GET `/api/search?q=...&market=SE` - direct search (non-agent)
3. GET `/api/offers?productId=...&market=SE` - direct offers lookup

### Phase 4: Frontend Chat UI
1. Add chat message components
2. Implement message history state
3. Connect to streaming API
4. Show loading states and typing indicators
5. Keep existing "Search Items" tab as direct search mode

### Phase 5: Polish
1. Error handling and retry logic
2. Rate limiting for API calls
3. Christmas-themed chat bubbles
4. Mobile responsive chat

## Agent Design

```typescript
// Output schema - what the agent returns
const GiftResponseSchema = z.object({
  message: z.string(),  // Conversational response
  products: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    brand: z.string().optional(),
    imageUrl: z.string().optional(),
    pricerunnerUrl: z.string(),  // Link to PriceRunner page
    price: z.object({
      min: z.number(),
      max: z.number(),
      currency: z.string(),
    }).optional(),
    reasoning: z.string(),  // Why this gift matches
  })).optional(),
});

const GiftFinderAgent = new Agent<ConversationInput, GiftResponse>({
  name: "GiftFinder",
  instructions: `You are Santa's helper finding the perfect gift.

    When the user describes someone:
    1. Think about what categories of gifts would suit them
    2. Use searchProducts to find options
    3. Use getOffers to get real prices
    4. Present 3-5 options with images, prices, and PriceRunner links
    5. Explain WHY each gift matches the person

    When user gives feedback:
    - "too expensive" → search for budget alternatives
    - "they don't like X" → exclude that category
    - "something more personal" → focus on personalized items

    Always include the PriceRunner URL so users can buy!
    Always be cheerful and festive! 🎄`,
  tools: [searchProductsTool, getOffersTool],
  outputSchema: GiftResponseSchema,
});
```

## Chat UI with Product Previews

```
┌─────────────────────────────────────────────┐
│ 🎅 Tell me about the person!               │
├─────────────────────────────────────────────┤
│ 👤 My dad loves gardening and coffee       │
├─────────────────────────────────────────────┤
│ 🎅 Great! Here are some gift ideas:        │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ [📷 Image]  Delonghi Coffee Machine     │ │
│ │             Brand: De'Longhi            │ │
│ │             💰 2,499 - 3,200 SEK        │ │
│ │             "Perfect for a coffee lover"│ │
│ │             [View on PriceRunner →]     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ [📷 Image]  Garden Tool Set             │ │
│ │             Brand: Fiskars              │ │
│ │             💰 899 - 1,200 SEK          │ │
│ │             "Great for gardening hobby" │ │
│ │             [View on PriceRunner →]     │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ 👤 The coffee machine is too expensive     │
├─────────────────────────────────────────────┤
│ 🎅 Let me find some budget coffee options..│
└─────────────────────────────────────────────┘
```

## Deployment
Single command deployment:
```bash
npm run build    # Build frontend
npm start        # Express serves API + static files
```

Can deploy to: Railway, Render, Fly.io, or any Node.js host.

## Questions Resolved
- ✅ Backend: Express server (simple, serves both API and frontend build)
- ✅ Flow: Multi-turn conversation (leverages Agent SDK properly)
