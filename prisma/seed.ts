import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Materials
  await prisma.materialBase.createMany({
    data: [
      { tipo: 'PETix', espesorMicras: 200, costoUnitarioUsd: 0.50, proveedor: 'TrustCard' },
      { tipo: 'PVC', espesorMicras: 100, costoUnitarioUsd: 0.10, proveedor: 'Local' },
      { tipo: 'Policarbonato', espesorMicras: 100, costoUnitarioUsd: 0.80, proveedor: 'Imported' },
      { tipo: 'Compuesto', espesorMicras: 800, costoUnitarioUsd: 2.50, proveedor: 'Bundle' }, // Just in case, though usually assembled
    ],
    skipDuplicates: true
  })

  // 2. Chips
  await prisma.chip.createMany({
    data: [
      { modelo: 'Mifare EV1', interfaz: 'Contactless', costoUnitario: 1.50, diasCreditoProveedor: 30 },
      { modelo: 'JCOP 4 P60', interfaz: 'Dual', costoUnitario: 3.50, diasCreditoProveedor: 45 },
      { modelo: 'SLE 77', interfaz: 'Contacto', costoUnitario: 0.90, diasCreditoProveedor: 30 },
    ],
    skipDuplicates: true
  })

  // 3. Processes
  await prisma.procesoFab.createMany({
    data: [
      { nombreEtapa: 'Preprensa', costoHoraOperador: 20, costoEnergia: 5, factorDesgasteMaquinaPorUnidad: 0.01 },
      { nombreEtapa: 'Offset', costoHoraOperador: 50, costoEnergia: 20, factorDesgasteMaquinaPorUnidad: 0.05 },
      { nombreEtapa: 'Serigrafía', costoHoraOperador: 35, costoEnergia: 15, factorDesgasteMaquinaPorUnidad: 0.04 },
      { nombreEtapa: 'Laminación', costoHoraOperador: 40, costoEnergia: 50, factorDesgasteMaquinaPorUnidad: 0.10 },
      { nombreEtapa: 'Troquelado', costoHoraOperador: 30, costoEnergia: 10, factorDesgasteMaquinaPorUnidad: 0.02 },
      { nombreEtapa: 'Chip Encoding', costoHoraOperador: 45, costoEnergia: 10, factorDesgasteMaquinaPorUnidad: 0.03 },
      { nombreEtapa: 'QC', costoHoraOperador: 15, costoEnergia: 2, factorDesgasteMaquinaPorUnidad: 0.00 },
    ],
    skipDuplicates: true
  })

  // 4. Security
  await prisma.seguridad.createMany({
    data: [
      { nombre: 'Tinta OVI' },
      { nombre: 'Holograma Estándar' },
      { nombre: 'Microtexto UV' },
    ],
    skipDuplicates: true
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
