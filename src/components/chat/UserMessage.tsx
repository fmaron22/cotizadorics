import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface __UserMessageProps {
    children: React.ReactNode;
    className?: string;
}

export function UserMessage({ children, className }: __UserMessageProps) {
    return (
        <div className={cn("flex gap-3 max-w-[80%] ml-auto flex-row-reverse", className)}>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-secondary-foreground" />
            </div>
            <div className="flex flex-col gap-1 items-end">
                <span className="text-xs text-muted-foreground font-medium">Tú</span>
                <div className="bg-primary px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm text-sm text-primary-foreground leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
}
