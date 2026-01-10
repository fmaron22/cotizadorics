
import { db } from '../src/lib/mock-db';

async function testCreate() {
    console.log('--- Testing Create Functionality ---');

    // 1. Test Creating Material
    console.log('\n[1] Creating new Material...');
    const newMat = {
        id: 'test-create-id',
        tipo: 'PET' as any, // Cast to any to bypass strict literal type for test if needed
        espesorMicras: 300,
        costoUnitarioUsd: 0.75,
        customVariables: { brand: 'NewTestBrand', origin: 'Lab' }
    };

    try {
        const added = db.materials.add(newMat);
        console.log('PASS: Added material:', added);

        const retrieved = db.materials.getById('test-create-id');
        if (retrieved && retrieved.customVariables?.brand === 'NewTestBrand') {
            console.log('PASS: Retrieved material matches input');
        } else {
            console.error('FAIL: Retrieved material mismatch', retrieved);
        }
    } catch (e) {
        console.error('FAIL: Error adding material', e);
    }

    console.log('--- Test Complete ---');
}

testCreate().catch(console.error);
