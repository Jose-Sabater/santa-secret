import { useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SearchFormProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export const SearchForm = ({ onSubmit, isLoading, initialValue }: SearchFormProps) => {
  const [query, setQuery] = useState(initialValue || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ShoppingBag className="w-4 h-4 text-christmas-green" />
          What are you looking for?
        </label>
        <Input
          placeholder="e.g., Wireless headphones, cozy blanket, cookbook..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-background border-border focus:border-christmas-gold focus:ring-christmas-gold/20"
          required
        />
      </div>

      <Button
        type="submit"
        variant="green"
        size="lg"
        className="w-full"
        disabled={isLoading || !query.trim()}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Search Items
          </>
        )}
      </Button>
    </form>
  );
};
