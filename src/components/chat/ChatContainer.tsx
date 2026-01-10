"use client";

import { useState, useRef, useEffect } from "react";
import { BotMessage } from "./BotMessage";
import { UserMessage } from "./UserMessage";
import { InputArea, InputMode, Option } from "./InputArea";
import { QuoteInput, MaterialType, MaterialBase, Chip, Seguridad, ProcesoFab } from "@/lib/types";
import { EngineeringEngine } from "@/lib/engine";
import { FinancialEngine } from "@/lib/financial";
import { Loader2 } from "lucide-react";
import { getMaterials, getChips, getSecurityFeatures, getProcesses } from "@/app/actions";


type Step = 'welcome' | 'cliente' | 'volumen' | 'material' | 'chip' | 'seguridad' | 'credito_cliente' | 'anticipo' | 'calculating' | 'done';

interface Message {
    id: string;
    role: 'bot' | 'user';
    content: string | React.ReactNode;
}

export function ChatContainer() {
    // State for Data
    const [dbData, setDbData] = useState<{
        materials: MaterialBase[];
        chips: Chip[];
        features: Seguridad[];
        processes: ProcesoFab[];
    }>({ materials: [], chips: [], features: [], processes: [] });
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'bot', content: "¡Hola! Soy tu asistente de cotización ID-Secure. Vamos a configurar una nueva tarjeta. ¿Para qué cliente es este proyecto?" }
    ]);
    const [currentStep, setCurrentStep] = useState<Step>('cliente');
    const [inputData, setInputData] = useState<Partial<QuoteInput>>({});
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load Data on Mount
    useEffect(() => {
        const load = async () => {
            try {
                const [materials, chips, features, processes] = await Promise.all([
                    getMaterials(),
                    getChips(),
                    getSecurityFeatures(),
                    getProcesses()
                ]);
                setDbData({ materials, chips, features, processes });
            } catch (error) {
                console.error("Error loading data", error);
                addMessage('bot', "Error conectando a la base de datos.");
            } finally {
                setIsLoadingData(false);
            }
        };
        load();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const addMessage = (role: 'bot' | 'user', content: string | React.ReactNode) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role, content }]);
    };

    const simulateThinking = async (ms = 800) => {
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, ms));
        setIsTyping(false);
    };

    const handleInput = async (value: any) => {
        // Add user message
        let displayValue = value;
        if (currentStep === 'chip') {
            const chip = dbData.chips.find((c) => c.id === value);
            displayValue = chip ? chip.modelo : value;
        } else if (currentStep === 'seguridad') {
            // Multi select
            const feats = dbData.features.filter((f) => (value as string[]).includes(f.id));
            displayValue = feats.map((f) => f.nombre).join(", ") || "Ninguna";
        }

        addMessage('user', displayValue);
        await simulateThinking();

        // Process Step
        switch (currentStep) {
            case 'cliente':
                setInputData({ ...inputData, cliente: value });
                addMessage('bot', `Entendido, cliente **${value}**. ¿Cuál es el volumen mensual estimado?`);
                setCurrentStep('volumen');
                break;

            case 'volumen':
                const vol = parseInt(value);
                if (isNaN(vol)) {
                    addMessage('bot', "Por favor ingresa un número válido.");
                    return;
                }
                setInputData({ ...inputData, volumenMensual: vol });
                addMessage('bot', "¿Qué tipo de estructura requiere la tarjeta?");
                setCurrentStep('material');
                break;

            case 'material':
                setInputData({ ...inputData, tipoMaterial: value as MaterialType });
                addMessage('bot', "¿Qué chip integraremos? (Si aplica)");
                setCurrentStep('chip');
                break;

            case 'chip':
                const chipId = value === 'none' ? undefined : value;
                setInputData({ ...inputData, chipId });
                addMessage('bot', "Selecciona los elementos de seguridad requeridos:");
                setCurrentStep('seguridad');
                break;

            case 'seguridad':
                setInputData({ ...inputData, featuresSeguridadIds: value });
                addMessage('bot', "¿Qué días de crédito daremos al cliente? (0 para pago de contado)");
                setCurrentStep('credito_cliente');
                break;

            case 'credito_cliente':
                const diasCredito = parseInt(value);
                if (isNaN(diasCredito)) {
                    addMessage('bot', "Ingresa un número válido.");
                    return;
                }
                setInputData({ ...inputData, diasCreditoCliente: diasCredito });
                addMessage('bot', "¿Solicitaremos anticipo? Ingresa el porcentaje (0 - 100%):");
                setCurrentStep('anticipo');
                break;

            case 'anticipo':
                let pct = parseFloat(value);
                if (isNaN(pct) || pct < 0 || pct > 100) {
                    addMessage('bot', "Por favor ingresa un porcentaje válido (0-100).");
                    return;
                }
                setInputData({ ...inputData, porcentajeAnticipo: pct / 100 });
                addMessage('bot', "Calculando cotización...");
                setCurrentStep('calculating');
                await simulateThinking(1500);
                calculateFinalQuote(pct / 100); // pass latest value as state might not update instant in closure
                break;
        }
    };

    const calculateFinalQuote = (finalPctAnticipo?: number) => {
        // Combine state
        const finalInput: QuoteInput = {
            cliente: inputData.cliente!,
            volumenMensual: inputData.volumenMensual!,
            tipoMaterial: inputData.tipoMaterial!,
            chipId: inputData.chipId,
            featuresSeguridadIds: inputData.featuresSeguridadIds || [],
            diasFabricacion: 30, // Default for now
            diasCreditoCliente: inputData.diasCreditoCliente || 0,
            porcentajeAnticipo: finalPctAnticipo !== undefined ? finalPctAnticipo : (inputData.porcentajeAnticipo || 0),
            margenDeseado: 0.35
        };

        // Run Engine with Real Data
        const engEngine = new EngineeringEngine(dbData.materials, dbData.chips, dbData.processes);
        const finEngine = new FinancialEngine(dbData.materials);

        const structure = engEngine.buildStructure(finalInput);
        const features = dbData.features.filter((f) => finalInput.featuresSeguridadIds.includes(f.id));
        const procesos = engEngine.determineProcesses(finalInput, structure, features);

        // Industrial Calculation
        const prodReqs = engEngine.calculateProductionRequirements(finalInput.volumenMensual, procesos);

        const chip = dbData.chips.find((c) => c.id === finalInput.chipId);

        const result = finEngine.calculate(finalInput, structure, procesos, chip, features, prodReqs);

        addMessage('bot', (
            <div className="flex flex-col gap-2">
                <h3 className="font-bold text-lg text-primary">Resumen de Cotización</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-muted-foreground">Estructura:</span>
                    <span className="font-medium text-right">{structure.tipo}</span>

                    <span className="text-muted-foreground">Costo Directo:</span>
                    <span className="font-medium text-right">${result.totalDirecto.toFixed(2)}</span>

                    <span className="text-muted-foreground">Landed + Scrap:</span>
                    <span className="font-medium text-right">${result.scrap.toFixed(2)}</span>

                    <span className="text-muted-foreground">Ciclo Efectivo:</span>
                    <div className="text-right flex flex-col">
                        <span className={`font-medium ${result.cicloEfectivoDias > 45 ? 'text-red-400' : 'text-green-400'}`}>
                            {result.cicloEfectivoDias.toFixed(1)} días
                        </span>
                        <span className="text-xs text-muted-foreground">
                            (Fab: 30 + Créd: {finalInput.diasCreditoCliente})
                        </span>
                    </div>

                    <span className="text-muted-foreground">Costo Financiero:</span>
                    <span className="font-medium text-right text-yellow-500">${result.financiero.toFixed(4)}</span>

                    <div className="col-span-2 border-t border-border my-2"></div>

                    <span className="font-bold text-primary">Precio Sugerido:</span>
                    <span className="font-bold text-primary text-right text-lg">${result.sugerido.toFixed(2)}</span>
                </div>
            </div>
        ));
        setCurrentStep('done');
    };

    // Determine Input Props based on Step
    let inputProps: any = { mode: 'text', placeholder: '...' };

    switch (currentStep) {
        case 'volumen':
            inputProps = { mode: 'number', placeholder: 'Ej. 50000' };
            break;
        case 'material':
            inputProps = {
                mode: 'select',
                options: [
                    { id: '1', value: 'Compuesto', label: 'Material Compuesto', subLabel: 'PVC + PETix' },
                    { id: '2', value: 'Policarbonato', label: '100% Policarbonato', subLabel: 'Alta Seguridad' },
                ]
            };
            break;
        case 'chip':
            inputProps = {
                mode: 'select',
                options: [
                    { id: '0', value: 'none', label: 'Sin Chip' },
                    ...dbData.chips.map((c) => ({ id: c.id, value: c.id, label: c.modelo, subLabel: c.interfaz }))
                ]
            };
            break;
        case 'seguridad':
            inputProps = {
                mode: 'multi-select',
                options: dbData.features.map((f) => ({ id: f.id, value: f.id, label: f.nombre }))
            };
            break;
        case 'credito_cliente':
            inputProps = { mode: 'number', placeholder: 'Días (ej. 30, 60)' };
            break;
        case 'anticipo':
            inputProps = { mode: 'number', placeholder: '% Porcentaje (0-100)' };
            break;
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.map(msg => (
                    msg.role === 'bot'
                        ? <BotMessage key={msg.id}>{msg.content}</BotMessage>
                        : <UserMessage key={msg.id}>{msg.content}</UserMessage>
                ))}
                {isTyping && (
                    <div className="flex gap-2 ml-10">
                        <span className="animate-bounce bg-primary/50 w-2 h-2 rounded-full delay-0"></span>
                        <span className="animate-bounce bg-primary/50 w-2 h-2 rounded-full delay-100"></span>
                        <span className="animate-bounce bg-primary/50 w-2 h-2 rounded-full delay-200"></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {currentStep !== 'done' && currentStep !== 'calculating' && (
                <InputArea onSend={handleInput} {...inputProps} isLoading={isTyping} />
            )}
        </div>
    );
}
