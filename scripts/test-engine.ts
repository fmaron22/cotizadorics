import { EngineeringEngine } from '../src/lib/engine';
import { FinancialEngine } from '../src/lib/financial';
import { MaterialBase, Chip, ProcesoFab, QuoteInput, Seguridad } from '../src/lib/types';

// MOCK DATA
const mockMaterials: MaterialBase[] = [
    { id: 'm1', tipo: 'PETix', espesorMicras: 200, costoUnitarioUsd: 0.50 }, // Core
    { id: 'm2', tipo: 'PVC', espesorMicras: 100, costoUnitarioUsd: 0.10 },   // Layer/Overlay
    { id: 'm3', tipo: 'Policarbonato', espesorMicras: 100, costoUnitarioUsd: 0.80 },
];

const mockChips: Chip[] = [
    { id: 'c1', modelo: 'Mifare', interfaz: 'Contactless', costoUnitario: 1.50, diasCreditoProveedor: 30 },
    { id: 'c2', modelo: 'JCOP', interfaz: 'Dual', costoUnitario: 3.50, diasCreditoProveedor: 45 },
];

const mockProcesos: ProcesoFab[] = [
    { id: 'p1', nombreEtapa: 'Preprensa', costoHoraOperador: 20, costoEnergia: 5, factorDesgasteMaquinaPorUnidad: 0.01 },
    { id: 'p2', nombreEtapa: 'Offset', costoHoraOperador: 50, costoEnergia: 20, factorDesgasteMaquinaPorUnidad: 0.05 },
    { id: 'p3', nombreEtapa: 'Laminación', costoHoraOperador: 40, costoEnergia: 50, factorDesgasteMaquinaPorUnidad: 0.10 },
    { id: 'p4', nombreEtapa: 'Troquelado', costoHoraOperador: 30, costoEnergia: 10, factorDesgasteMaquinaPorUnidad: 0.02 },
    { id: 'p5', nombreEtapa: 'Serigrafía', costoHoraOperador: 35, costoEnergia: 15, factorDesgasteMaquinaPorUnidad: 0.04 }, // For OVI
];

const mockFeatures: Seguridad[] = [
    { id: 's1', nombre: 'Tinta OVI' },
    { id: 's2', nombre: 'Holograma' },
];

// INSTANTIATE ENGINES
const engEngine = new EngineeringEngine(mockMaterials, mockChips, mockProcesos);
const finEngine = new FinancialEngine(mockMaterials);

// SIMULATION INPUT
const input: QuoteInput = {
    cliente: 'Gobierno Test',
    volumenMensual: 50000,
    tipoMaterial: 'Compuesto', // Should trigger Modo A
    chipId: 'c1', // Contactless -> Should trigger Inlay
    featuresSeguridadIds: ['s1'], // OVI -> Should trigger Serigrafía
    diasFabricacion: 30,
    diasCreditoCliente: 64,
    margenDeseado: 0.35
};

console.log('--- RUNNING SIMULATION ---');
console.log('Input:', JSON.stringify(input, null, 2));

// 1. Build Structure
const structure = engEngine.buildStructure(input);
console.log('\n1. Structure Built:', structure.tipo);
console.log('   Layers:', structure.capas.length);
console.log('   Has Inlay (Rule: Chip Contactless?):', structure.tieneInlay);
console.log('   Total Thickness:', structure.espesorTotalMicras);

// 2. Determine Processes
const features = mockFeatures.filter(f => input.featuresSeguridadIds.includes(f.id));
const procesos = engEngine.determineProcesses(input, structure, features);
console.log('\n2. Processes Routing:', procesos.map(p => p.nombreEtapa).join(', '));
console.log('   Expect "Serigrafía" due to OVI? ' + (procesos.some(p => p.nombreEtapa === 'Serigrafía') ? 'YES' : 'NO'));

// 3. Financials
const chip = mockChips.find(c => c.id === input.chipId);
const result = finEngine.calculate(input, structure, procesos, chip, features);

console.log('\n3. Financial Results:');
console.log('   Direct Cost:', result.totalDirecto.toFixed(4));
console.log('   Landed Cost (+5%):', result.landed.toFixed(4));
console.log('   Scrap Cost (+3%):', result.scrap.toFixed(4));
console.log('   Cash Cycle Days:', result.cicloEfectivoDias);
console.log('   Financial Cost:', result.financiero.toFixed(4));
console.log('   Suggested Price:', result.sugerido.toFixed(4));
console.log('   Theoretical Margin:', (result.margenTeorico * 100).toFixed(2) + '%');
