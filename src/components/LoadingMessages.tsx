import { useState, useEffect } from "react";
import { Gift, Sparkles, TreePine, Star, Candy } from "lucide-react";

const CHRISTMAS_MESSAGES = [
  { text: "Checking Santa's list twice...", icon: Gift },
  { text: "Asking the elves for suggestions...", icon: Sparkles },
  { text: "Searching the North Pole warehouse...", icon: TreePine },
  { text: "Consulting with Rudolph...", icon: Star },
  { text: "Unwrapping gift ideas...", icon: Gift },
  { text: "Sprinkling some Christmas magic...", icon: Sparkles },
  { text: "Jingling all the way through products...", icon: Candy },
  { text: "Ho ho ho! Almost there...", icon: TreePine },
  { text: "Making spirits bright...", icon: Star },
  { text: "Decking the halls with options...", icon: Gift },
  { text: "Spreading holiday cheer...", icon: Sparkles },
  { text: "Wrapping up the search...", icon: Gift },
];

interface LoadingMessagesProps {
  agentMessage?: string;
}

export const LoadingMessages = ({ agentMessage }: LoadingMessagesProps) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Rotate through messages every 2.5 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % CHRISTMAS_MESSAGES.length);
    }, 2500);

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  const currentMessage = CHRISTMAS_MESSAGES[messageIndex];
  const Icon = currentMessage.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      {/* Animated icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-festive flex items-center justify-center animate-pulse">
          <Icon className="w-10 h-10 text-white animate-bounce" />
        </div>
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-6 h-6 text-christmas-gold animate-twinkle" />
        </div>
      </div>

      {/* Message */}
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-foreground">
          {currentMessage.text}
        </p>

        {/* Agent message if available */}
        {agentMessage && (
          <p className="text-sm text-muted-foreground italic max-w-md">
            {agentMessage}
          </p>
        )}

        {/* Loading dots */}
        <p className="text-2xl text-christmas-gold font-bold h-8">
          {dots || "\u00A0"}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-christmas-red to-christmas-green animate-shimmer"
          style={{
            width: "100%",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
    </div>
  );
};
