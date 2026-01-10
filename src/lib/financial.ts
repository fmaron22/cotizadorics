import { QuoteInput, Structure, ProcesoFab, QuoteResult, MaterialBase, Chip, Seguridad } from './types';

export class FinancialEngine {

    constructor(
        private materiales: MaterialBase[],
    ) { }

    public calculate(
        input: QuoteInput,
        structure: Structure,
        procesos: ProcesoFab[],
        chip: Chip | undefined,
        features: Seguridad[],
        productionReqs?: any
    ): QuoteResult['costos'] & QuoteResult['financials'] & QuoteResult['precios'] {

        const CARDS_PER_SHEET = 21;

        // 1. Determine Quantities
        // If productionReqs is provided (Industrial Mode), use it. Else fall back to linear (Legacy).
        const totalSheetsInput = productionReqs ? productionReqs.totalSheetsInput : Math.ceil(input.volumenMensual / CARDS_PER_SHEET);
        const grossCards = totalSheetsInput * CARDS_PER_SHEET;

        // 2. Material Cost (Sheets Based)
        let costoMateriales = 0;
        structure.capas.forEach(layer => {
            const material = this.materiales.find(m => m.id === layer.materialId);
            if (material) {
                // Price is per Sheet. We multiply by total sheets needed.
                // layer.cantidad is strictly how many sheets of that material per card composite? 
                // Usually layer.cantidad is 1 (e.g. 1 PVC Front).
                costoMateriales += (material.costoUnitarioUsd * totalSheetsInput * layer.cantidad);
            }
        });

        // 3. Chip Cost
        let costoChip = 0;
        if (chip) {
            // We pay for every chip entering the line (Gross)
            costoChip = chip.costoUnitario * grossCards;
        }

        // 4. Process Costs (Industrial: Time Based)
        let costoManoDeObra = 0;
        let costoDesgaste = 0; // Keeping legacy field name for sum

        if (productionReqs && productionReqs.processDetails) {
            productionReqs.processDetails.forEach((p: any) => {
                const stats = p.stats;
                const hours = stats.totalTime;

                const costPerHour = p.costoHoraOperador + p.costoEnergia;
                costoManoDeObra += (hours * costPerHour);

                // If we want to track specific machine wear or overhead separately:
                // costoDesgaste += ...
            });
        } else {
            // Fallback Legacy
            const UNITS_PER_HOUR = 3000;
            procesos.forEach(proc => {
                const laborAndEnergyPerHour = proc.costoHoraOperador + proc.costoEnergia;
                const costPerUnit = laborAndEnergyPerHour / UNITS_PER_HOUR;
                costoManoDeObra += (costPerUnit * input.volumenMensual);
            });
        }

        // 5. Consumables (Inks/Features)
        // Calculated on Gross Cards to account for waste
        let costoInsumos = 0;
        features.forEach(f => {
            if (f.costoPorUnidad && f.rendimientoPorUnidad && f.rendimientoPorUnidad > 0) {
                costoInsumos += ((f.costoPorUnidad / f.rendimientoPorUnidad) * grossCards);
            }
        });

        // 6. Total Direct Cost
        const totalDirecto = costoMateriales + costoChip + costoManoDeObra + costoDesgaste + costoInsumos;

        // 7. Landed Cost
        const landed = totalDirecto * 1.05;

        // 8. Scrap Cost 
        // In Industrial Mode, we already bought extra materials (sheets). 
        // Adding 1% contingency for unmodeled waste.
        const scrap = landed * 1.01;

        // 9. Financial & Cash Cycle
        // Normalize divisor for Unit Costs
        const unitDivisor = input.volumenMensual || 1;

        const diasFab = input.diasFabricacion || 30;
        const diasCreditoCliente = input.diasCreditoCliente || 0;
        const pctAnticipo = input.porcentajeAnticipo || 0;

        // Recalculate Weighted Credit based on TOTALS
        let weightedCredit = 0;
        structure.capas.forEach(layer => {
            const mat = this.materiales.find(m => m.id === layer.materialId);
            if (mat) {
                const totalMatCostRaw = (mat.costoUnitarioUsd * totalSheetsInput * layer.cantidad);
                weightedCredit += (totalMatCostRaw * (mat.diasCreditoProveedor || 30));
            }
        });
        if (chip) {
            weightedCredit += (costoChip * chip.diasCreditoProveedor);
        }

        const totalMatChipCost = costoMateriales + costoChip; // These are Totals now
        const diasCreditoProveedoresPromedio = totalMatChipCost > 0 ? (weightedCredit / totalMatChipCost) : 30;
        const cicloEfectivoDias = (diasFab + diasCreditoCliente) - diasCreditoProveedoresPromedio;

        const TASA_ANUAL = 0.30;
        let financiable = scrap * (1 - pctAnticipo);
        if (financiable < 0) financiable = 0;
        let costoFinanciero = financiable * (TASA_ANUAL / 360) * cicloEfectivoDias;
        if (costoFinanciero < 0) costoFinanciero = 0;

        // 10. Suggested Price (Total -> Unit)
        const margen = input.margenDeseado || 0.35;
        const precioSugeridoTotal = (scrap + costoFinanciero) / (1 - margen);

        return {
            materiales: costoMateriales / unitDivisor,
            chip: costoChip / unitDivisor,
            manoDeObra: costoManoDeObra / unitDivisor,
            desgasteMaquinaria: costoDesgaste / unitDivisor,
            totalDirecto: totalDirecto / unitDivisor,
            landed: landed / unitDivisor,
            scrap: scrap / unitDivisor,
            financiero: costoFinanciero / unitDivisor,
            cicloEfectivoDias,
            diasCreditoChip: chip ? chip.diasCreditoProveedor : 30,
            sugerido: precioSugeridoTotal / unitDivisor,
            margenTeorico: (precioSugeridoTotal - (scrap + costoFinanciero)) / precioSugeridoTotal
        };
    }
}
