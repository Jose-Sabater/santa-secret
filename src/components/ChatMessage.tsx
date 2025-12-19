import { User, Bot } from "lucide-react";
import { GiftCard, GiftItem } from "./GiftCard";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  products?: GiftItem[];
}

export const ChatMessage = ({ role, content, products }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-christmas-green text-white"
            : "bg-gradient-festive text-white"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5" />
        ) : (
          <Bot className="w-5 h-5" />
        )}
      </div>

      {/* Message content */}
      <div
        className={`flex-1 ${isUser ? "text-right" : ""} max-w-[85%]`}
      >
        <div
          className={`inline-block p-4 rounded-2xl ${
            isUser
              ? "bg-christmas-green/10 text-foreground rounded-tr-sm"
              : "bg-card border border-border/50 rounded-tl-sm"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>

        {/* Products grid */}
        {products && products.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {products.map((product) => (
              <GiftCard key={product.id} gift={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
