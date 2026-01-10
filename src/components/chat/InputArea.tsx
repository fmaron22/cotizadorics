import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { MaterialType } from "@/lib/types";

// Types for the input configuration
export type InputMode = 'text' | 'select' | 'multi-select' | 'number' | 'confirmation';

export interface Option {
    id: string;
    label: string;
    subLabel?: string;
    value: string;
}

interface __InputAreaProps {
    mode: InputMode;
    options?: Option[];
    placeholder?: string;
    defaultValue?: string;
    onSend: (value: any) => void;
    isLoading?: boolean;
}

export function InputArea({ mode, options = [], placeholder, onSend, isLoading, defaultValue }: __InputAreaProps) {
    const [inputValue, setInputValue] = useState(defaultValue || "");
    const [selectedMulti, setSelectedMulti] = useState<string[]>([]);

    useEffect(() => {
        setInputValue(defaultValue || "");
        setSelectedMulti([]);
    }, [mode, defaultValue]); // Removed options from dependency array to avoid reset loop due to new array reference

    const handleSend = () => {
        if (mode === 'multi-select') {
            onSend(selectedMulti);
        } else {
            if (!inputValue.trim()) return;
            onSend(inputValue);
            setInputValue("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && mode !== 'multi-select') {
            handleSend();
        }
    };

    const toggleMulti = (id: string) => {
        if (selectedMulti.includes(id)) {
            setSelectedMulti(prev => prev.filter(i => i !== id));
        } else {
            setSelectedMulti(prev => [...prev, id]);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4 text-muted-foreground animate-pulse">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando...
            </div>
        )
    }

    if (mode === 'select') {
        return (
            <div className="flex gap-2 p-2 bg-card/50 backdrop-blur-sm border-t border-border/50">
                <Select onValueChange={(val) => onSend(val)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={placeholder || "Selecciona una opción..."} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map(opt => (
                            <SelectItem key={opt.id} value={opt.value}>
                                <span className="font-medium">{opt.label}</span>
                                {opt.subLabel && <span className="ml-2 text-muted-foreground text-xs">({opt.subLabel})</span>}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    if (mode === 'multi-select') {
        return (
            <div className="flex flex-col gap-2 p-2 bg-card/50 backdrop-blur-sm border-t border-border/50">
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                    {options.map(opt => (
                        <div
                            key={opt.id}
                            onClick={() => toggleMulti(opt.id)}
                            className={`
                            cursor-pointer px-3 py-2 rounded-lg border text-sm transition-all flex items-center gap-2
                            ${selectedMulti.includes(opt.id)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background border-input hover:bg-accent"}
                        `}
                        >
                            {opt.label}
                            {selectedMulti.includes(opt.id) && <Check className="w-3 h-3" />}
                        </div>
                    ))}
                </div>
                <Button onClick={handleSend} disabled={selectedMulti.length === 0} className="w-full">
                    Confirmar Selección ({selectedMulti.length})
                </Button>
            </div>
        )
    }

    if (mode === 'confirmation') {
        return (
            <div className="flex gap-2 p-2 bg-card/50 backdrop-blur-sm border-t border-border/50 justify-center">
                <Button onClick={() => onSend('yes')} variant="default" className="flex-1">Sí, correcto</Button>
                <Button onClick={() => onSend('no')} variant="outline" className="flex-1">No, ajustar</Button>
            </div>
        )
    }

    return (
        <div className="flex gap-2 p-2 bg-card/50 backdrop-blur-sm border-t border-border/50">
            <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || "Escribe tu respuesta..."}
                className="flex-1"
                type={mode === 'number' ? "number" : "text"}
                autoFocus
            />
            <Button size="icon" onClick={handleSend} disabled={!inputValue.trim()}>
                <Send className="w-4 h-4" />
            </Button>
        </div>
    );
}
