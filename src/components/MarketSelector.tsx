import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const MARKETS = [
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
];

interface MarketSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MarketSelector = ({ value, onChange }: MarketSelectorProps) => {
  const selectedMarket = MARKETS.find((m) => m.code === value);

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px] bg-background">
          {selectedMarket ? (
            <span className="flex items-center gap-2">
              <span>{selectedMarket.flag}</span>
              <span>{selectedMarket.name}</span>
            </span>
          ) : (
            <SelectValue placeholder="Select market" />
          )}
        </SelectTrigger>
        <SelectContent>
          {MARKETS.map((market) => (
            <SelectItem key={market.code} value={market.code}>
              <span className="flex items-center gap-2">
                <span>{market.flag}</span>
                <span>{market.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
