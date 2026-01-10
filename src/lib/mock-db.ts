
import { MaterialBase, Chip, ProcesoFab, Seguridad, MaterialType, ChipInterface } from './types';

// Generic wrapper for records with metadata
export interface MockRecord<T> {
    id: string;
    data: T;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}

export interface HistoryEntry<T> {
    recordId: string;
    version: number;
    data: T;
    changedAt: Date;
    changeDescription: string;
}

class MockCollection<T extends { id: string }> {
    private records: Map<string, MockRecord<T>> = new Map();
    private history: HistoryEntry<T>[] = [];

    constructor(initialData: T[]) {
        initialData.forEach(item => {
            this.records.set(item.id, {
                id: item.id,
                data: item,
                createdAt: new Date(),
                updatedAt: new Date(),
                version: 1
            });
        });
    }

    getAll(): T[] {
        return Array.from(this.records.values()).map(r => r.data);
    }

    getById(id: string): T | undefined {
        return this.records.get(id)?.data;
    }

    update(id: string, updates: Partial<T>, description: string = "Actualización manual"): T {
        const current = this.records.get(id);
        if (!current) throw new Error(`Record ${id} not found`);

        // Save history
        this.history.push({
            recordId: id,
            version: current.version,
            data: { ...current.data }, // Snapshot
            changedAt: new Date(),
            changeDescription: description
        });

        // Apply updates
        const newData = { ...current.data, ...updates };
        this.records.set(id, {
            ...current,
            data: newData,
            updatedAt: new Date(),
            version: current.version + 1
        });

        return newData;
    }

    add(item: T): T {
        if (this.records.has(item.id)) throw new Error(`ID ${item.id} already exists`);
        this.records.set(item.id, {
            id: item.id,
            data: item,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1
        });
        return item;
    }

    getHistory(id: string): HistoryEntry<T>[] {
        return this.history.filter(h => h.recordId === id).sort((a, b) => b.version - a.version);
    }
}

// Initial Data
const INITIAL_MATERIALS: MaterialBase[] = [
    { id: 'm1', tipo: 'PETix', espesorMicras: 200, costoUnitarioUsd: 0.50, proveedor: 'TrustCard', leadTimeWeeks: 4, diasCreditoProveedor: 30, customVariables: { brand: 'TrustCard Premium' } },
    { id: 'm2', tipo: 'PVC', espesorMicras: 100, costoUnitarioUsd: 0.10, proveedor: 'Local', leadTimeWeeks: 2, diasCreditoProveedor: 30, customVariables: {} },
    { id: 'm3', tipo: 'Policarbonato', espesorMicras: 100, costoUnitarioUsd: 0.80, proveedor: 'Imported', leadTimeWeeks: 8, diasCreditoProveedor: 45, customVariables: { origin: 'Germany' } },
];

const INITIAL_CHIPS: Chip[] = [
    { id: 'c1', modelo: 'Mifare EV1', interfaz: 'Contactless', costoUnitario: 1.50, diasCreditoProveedor: 30, customVariables: { capacitance: '17pF' } },
    { id: 'c2', modelo: 'JCOP 4 P60', interfaz: 'Dual', costoUnitario: 3.50, diasCreditoProveedor: 45, customVariables: { osVersion: 'JCOP4' } },
    { id: 'c3', modelo: 'SLE 77', interfaz: 'Contacto', costoUnitario: 0.90, diasCreditoProveedor: 30, customVariables: {} },
];

const INITIAL_PROCESSES: ProcesoFab[] = [
    { id: 'p1', nombreEtapa: 'Preprensa', costoHoraOperador: 20, costoEnergia: 5, factorDesgasteMaquinaPorUnidad: 0.01, setupTimeHours: 2, runSpeedSheetsPerHour: 0, setupScrapSheets: 10, scrapRate: 0, customVariables: { department: 'Pre-press' } },
    { id: 'p2', nombreEtapa: 'Offset', costoHoraOperador: 50, costoEnergia: 20, factorDesgasteMaquinaPorUnidad: 0.05, setupTimeHours: 1.5, runSpeedSheetsPerHour: 3000, setupScrapSheets: 50, scrapRate: 0.03, customVariables: { maxColors: 4 } },
    { id: 'p3', nombreEtapa: 'Serigrafía', costoHoraOperador: 35, costoEnergia: 15, factorDesgasteMaquinaPorUnidad: 0.04, setupTimeHours: 1, runSpeedSheetsPerHour: 800, setupScrapSheets: 15, scrapRate: 0.04, customVariables: { meshType: 'High tension' } },
    { id: 'p4', nombreEtapa: 'Laminación', costoHoraOperador: 40, costoEnergia: 50, factorDesgasteMaquinaPorUnidad: 0.10, setupTimeHours: 2, runSpeedSheetsPerHour: 400, setupScrapSheets: 10, scrapRate: 0.02, customVariables: {} },
    { id: 'p5', nombreEtapa: 'Troquelado', costoHoraOperador: 30, costoEnergia: 10, factorDesgasteMaquinaPorUnidad: 0.02, setupTimeHours: 1, runSpeedSheetsPerHour: 2000, setupScrapSheets: 20, scrapRate: 0.01, customVariables: {} },
    { id: 'p6', nombreEtapa: 'Chip Encoding', costoHoraOperador: 45, costoEnergia: 10, factorDesgasteMaquinaPorUnidad: 0.03, setupTimeHours: 0.5, runSpeedSheetsPerHour: 1000, setupScrapSheets: 5, scrapRate: 0.01, customVariables: { protocol: 'ISO14443' } },
];

const INITIAL_FEATURES: Seguridad[] = [
    { id: 's1', nombre: 'Tinta OVI', unidadMedida: 'Litro', costoPorUnidad: 200, rendimientoPorUnidad: 50000, customVariables: { color: 'Green-to-Purple' } },
    { id: 's2', nombre: 'Holograma Estándar', unidadMedida: 'Unidad', costoPorUnidad: 0.15, rendimientoPorUnidad: 1, customVariables: {} },
    { id: 's3', nombre: 'Microtexto UV', unidadMedida: 'Litro', costoPorUnidad: 150, rendimientoPorUnidad: 100000, customVariables: { wavelength: '365nm' } },
];

class MockDatabase {
    materials = new MockCollection<MaterialBase>(INITIAL_MATERIALS);
    chips = new MockCollection<Chip>(INITIAL_CHIPS);
    processes = new MockCollection<ProcesoFab>(INITIAL_PROCESSES);
    features = new MockCollection<Seguridad>(INITIAL_FEATURES);
}

// Global Singleton
const globalForMock = globalThis as unknown as { mockDb_v2: MockDatabase | undefined };
export const db = globalForMock.mockDb_v2 ?? new MockDatabase();
if (process.env.NODE_ENV !== 'production') globalForMock.mockDb_v2 = db;
