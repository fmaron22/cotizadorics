import { QuoteInput, Structure, Layer, MaterialBase, Chip, Seguridad, ProcesoFab } from './types';

// Hardcoded logic for "Modo A" recipe as per requirements
export const MOD_A_RECIPE = {
    nucleo: { tipo: 'PETix', cantidad: 1 },
    capas: { tipo: 'PVC', cantidad: 2 },
    overlays: { tipo: 'PVC', cantidad: 2 } // Assuming Overlay is PVC for Std Composite or similar
};

export class EngineeringEngine {

    constructor(
        private materiales: MaterialBase[],
        private chips: Chip[],
        private procesos: ProcesoFab[]
    ) { }

    /**
     * Constructs the physical structure of the card based on inputs.
     * Handles "Modo A" automation and "Modo B" stacking.
     * Handles Inlay insertion rule.
     */
    public buildStructure(input: QuoteInput): Structure {
        let structure: Structure = {
            tipo: input.tipoMaterial === 'Policarbonato' ? 'Modo B' : 'Modo A',
            capas: [],
            espesorTotalMicras: 0,
            tieneInlay: false
        };

        // 1. Determine Base Structure
        if (structure.tipo === 'Modo A') {
            // Automatic Recipe: 1 PETix Core + 2 PVC Layers + 2 Overlays
            // We look up materials by type. This is a simplification; in production we'd filter by thickness too.
            const petix = this.materiales.find(m => m.tipo === 'PETix');
            const pvc = this.materiales.find(m => m.tipo === 'PVC'); // Assuming generic PVC for layers & overlays

            if (petix) structure.capas.push({ materialId: petix.id, cantidad: 1 });
            if (pvc) {
                structure.capas.push({ materialId: pvc.id, cantidad: 2 }); // Capas
                structure.capas.push({ materialId: pvc.id, cantidad: 2 }); // Overlays
            }
        } else {
            // Modo B (Policarbonato) - For now, default to a standard stack if not specified manually
            // Requirement says "Allow user to stack", but for MVP automation we'll default to 2 Core + 2 Overlay PC
            const pc = this.materiales.find(m => m.tipo === 'Policarbonato');
            if (pc) {
                structure.capas.push({ materialId: pc.id, cantidad: 2 }); // Core
                structure.capas.push({ materialId: pc.id, cantidad: 2 }); // Overlay
            }
        }

        // 2. Inlay Rule
        if (input.chipId) {
            const chip = this.chips.find(c => c.id === input.chipId);
            if (chip && (chip.interfaz === 'Contactless' || chip.interfaz === 'Dual')) {
                structure.tieneInlay = true;
                // Inlay is often a material layer itself (e.g., PET w/ antenna). 
                // We'll add a dummy "Inlay" material if not present, or assume one of the layers converts to Inlay.
                // For cost purposes, the Inlay is usually part of the Chip cost or a raw material. 
                // Here we mark it as a flag for cost calculation.
            }
        }

        // 3. Calculate Thickness
        structure.espesorTotalMicras = structure.capas.reduce((total, layer) => {
            const mat = this.materiales.find(m => m.id === layer.materialId);
            return total + (mat ? mat.espesorMicras * layer.cantidad : 0);
        }, 0);

        return structure;
    }

    /**
     * Determines the manufacturing processes required.
     * Handles "OVI" -> Serigraphy rule.
     * Handles "Policarbonato" -> Laminación adjustment.
     */
    public determineProcesses(input: QuoteInput, structure: Structure, features: Seguridad[]): ProcesoFab[] {
        const activeProcesses: ProcesoFab[] = [];

        // Base processes (Standard for all cards)
        const baseNames = ['Preprensa', 'Offset', 'Laminación', 'Troquelado', 'QC'];
        baseNames.forEach(name => {
            const p = this.procesos.find(proc => proc.nombreEtapa.includes(name));
            if (p) activeProcesses.push(p);
        });

        // Rule: OVI -> Serigrafía
        const hasOVI = features.some(f => f.nombre.includes('OVI'));
        if (hasOVI) {
            const serigrafia = this.procesos.find(p => p.nombreEtapa.includes('Serigrafía'));
            if (serigrafia && !activeProcesses.includes(serigrafia)) {
                activeProcesses.push(serigrafia);
            }
        }

        // Rule: Chip Processing
        if (input.chipId) {
            const chipEncoding = this.procesos.find(p => p.nombreEtapa.includes('Chip') || p.nombreEtapa.includes('Encoding'));
            if (chipEncoding && !activeProcesses.includes(chipEncoding)) {
                activeProcesses.push(chipEncoding);
            }
        }

        return activeProcesses;
    }
    // Industrial Calculation: Cumulative Scrap & Production Time
    calculateProductionRequirements(targetVolume: number, activeProcesses: ProcesoFab[]) {
        const CARDS_PER_SHEET = 21;
        const targetGoodSheets = Math.ceil(targetVolume / CARDS_PER_SHEET);

        // We need to order processes logically. 
        // For simplicity, we assume the input array is roughly in order (Preprensa -> Offset -> Serigrafia -> Lam -> Troquel -> Encoding)
        // or we iterate reverse assuming the order matters for scrap.
        // Actually, scrap in step N requires more input from N-1.
        // So we assume 'activeProcesses' are passed in manufacturing order.

        let currentRequiredSheets = targetGoodSheets;

        // REVERSE LOOP for Scrap Calculation
        // Step N Output = Step N-1 Input.
        // Step N Input = (Output + SetupScrap) / (1 - ScrapRate)

        // We clone and reverse to calculate inputs
        const reverseProcs = [...activeProcesses].reverse();
        const processRequirements = new Map<string, { inputSheets: number, outputSheets: number }>();

        reverseProcs.forEach(p => {
            const output = currentRequiredSheets;
            const scrapRate = p.scrapRate || 0;
            const setupScrap = p.setupScrapSheets || 0;

            // If process is sheet-based (most are), calc input.
            // If process is post-diecut (like encoding), it works on cards, but we can translate to sheets for material continuity 
            // or handle separately. For MVP, assume all main fab steps affect the sheet count needed.
            // Exceptions: Preprensa (doesn't consume sheets lineally, but provides plates).
            // Let's assume Preprensa has 0 runScrap, 0 setupScrap (or handled as plates).

            let input = output;
            if (p.nombreEtapa !== 'Preprensa') {
                input = Math.ceil((output + setupScrap) / (1 - scrapRate));
            }

            processRequirements.set(p.id, { inputSheets: input, outputSheets: output });
            currentRequiredSheets = input;
        });

        const totalSheetsToPrint = currentRequiredSheets; // This is what we need to buy materials for (max input)

        // FORWARD LOOP for Time Calculation
        const processDetails: any[] = [];
        activeProcesses.forEach(p => {
            const req = processRequirements.get(p.id);
            const inputAmount = req ? req.inputSheets : targetGoodSheets; // Fallback

            const setupTime = p.setupTimeHours || 0;
            const speed = p.runSpeedSheetsPerHour || 0;

            let runTime = 0;
            if (speed > 0) {
                runTime = inputAmount / speed;
            } else if (p.nombreEtapa === 'Chip Encoding') {
                // Encoding speed might be in cards/hr, need to adjust if param is sheets/hr or cards/hr
                // Our type is 'runSpeedSheetsPerHour'. If encoding is 1000 sheets/hr (~21000 cards/hr), ok.
                // If encoding is 2000 cards/hr -> ~100 sheets/hr.
                // Let's assume the DB value is normalized to Sheets/Hour or we interpret based on stage.
                // For now, assume parameter is correct Sheets/Hour.
            }

            processDetails.push({
                ...p,
                stats: {
                    inputSheets: inputAmount,
                    setupTime,
                    runTime,
                    totalTime: setupTime + runTime
                }
            });
        });

        return {
            totalSheetsInput: totalSheetsToPrint,
            targetGoodSheets,
            processDetails
        };
    }
}
