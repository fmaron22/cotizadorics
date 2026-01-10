import { cn } from "@/lib/utils";
import { Bot, Sparkles } from "lucide-react";

interface __BotMessageProps {
    children: React.ReactNode;
    className?: string;
}

export function BotMessage({ children, className }: __BotMessageProps) {
    return (
        <div className={cn("flex gap-3 max-w-[80%]", className)}>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1 border border-primary/20">
                <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    ID-Secure Bot <Sparkles className="w-3 h-3 text-yellow-500/50" />
                </span>
                <div className="bg-card border border-border/50 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm text-sm leading-relaxed text-card-foreground">
                    {children}
                </div>
            </div>
        </div>
    );
}
