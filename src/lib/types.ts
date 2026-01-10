// Core Domain Types

export type MaterialType = string; // Was union, relaxed for dynamic creation
export type ChipInterface = string; // Was union, relaxed

export interface MaterialBase {
    id: string;
    tipo: MaterialType;
    espesorMicras: number;
    costoUnitarioUsd: number;
    proveedor?: string | null;
    leadTimeWeeks?: number | null;
    diasCreditoProveedor?: number | null;
    customVariables?: Record<string, any> | null;
}

export interface Chip {
    id: string;
    modelo: string;
    interfaz: ChipInterface;
    costoUnitario: number;
    diasCreditoProveedor: number;
    leadTime?: number | null;
    customVariables?: Record<string, any> | null;
}

export interface Seguridad {
    id: string;
    nombre: string;
    insumoRequerido?: string | null;
    procesoVinculadoId?: string | null;
    unidadMedida?: string | null; // e.g. "Litro", "Kg", "Rollo"
    costoPorUnidad?: number | null;
    rendimientoPorUnidad?: number | null; // Cards per Unit
    customVariables?: Record<string, any> | null;
}

export interface ProcesoFab {
    id: string;
    nombreEtapa: string;
    costoHoraOperador: number;
    costoEnergia: number;
    factorDesgasteMaquinaPorUnidad: number; // Deprecated/Legacy
    // Industrial Params
    setupTimeHours?: number | null; // e.g. 1.5 hours
    runSpeedSheetsPerHour?: number | null; // e.g. 1000 sheets/hour
    setupScrapSheets?: number | null; // e.g. 20 sheets wasted for setup
    scrapRate?: number | null; // e.g. 0.02 for 2%
    customVariables?: Record<string, any> | null;
}

// Quote Input Types

export interface Layer {
    materialId: string;
    cantidad: number;
}

export interface Structure {
    tipo: 'Modo A' | 'Modo B'; // A=Compuesto, B=Policarbonato
    capas: Layer[];
    espesorTotalMicras: number;
    tieneInlay: boolean;
}

export interface QuoteInput {
    cliente: string;
    volumenMensual: number;
    tipoMaterial: MaterialType;
    chipId?: string;
    featuresSeguridadIds: string[];
    diasFabricacion?: number; // Default 30
    diasCreditoCliente?: number; // 0 if no credit
    porcentajeAnticipo?: number; // 0 to 1 (e.g. 0.5 for 50%)
    margenDeseado?: number; // e.g., 0.30 for 30%
}

// Engine Output Types

export interface QuoteResult {
    inputs: QuoteInput;
    structure: Structure;
    procesosAplicados: ProcesoFab[];
    costos: {
        materiales: number;
        chip: number;
        manoDeObra: number;
        desgasteMaquinaria: number;
        totalDirecto: number;
        landed: number;
        scrap: number;
        financiero: number;
    };
    financials: {
        cicloEfectivoDias: number;
        diasCreditoChip: number;
    };
    precios: {
        sugerido: number;
        margenTeorico: number;
    };
}
