
import { db } from '../src/lib/mock-db';

async function testVariables() {
    console.log('--- Testing Custom Variables ---');

    // 1. Check Initial Data
    console.log('\n[1] Checking Initial Materials...');
    const materials = db.materials.getAll();
    const matWithVar = materials.find(m => m.customVariables && Object.keys(m.customVariables).length > 0);

    if (matWithVar) {
        console.log(`PASS: Found material with variables: ${matWithVar.tipo}`, matWithVar.customVariables);
    } else {
        console.error('FAIL: No material with variables found in initial data');
    }

    // 2. Test Updating Variables
    console.log('\n[2] Testing Update...');
    const targetId = materials[0].id;
    const newVars = { ...materials[0].customVariables, testKey: 'testValue' };

    try {
        const updated = db.materials.update(targetId, { customVariables: newVars });
        if (updated.customVariables?.testKey === 'testValue') {
            console.log('PASS: Successfully updated customVariables', updated.customVariables);
        } else {
            console.error('FAIL: Update did not persist', updated);
        }
    } catch (e) {
        console.error('FAIL: Update threw error', e);
    }

    // 3. Check Other Catalogs
    console.log('\n[3] Checking Chips...');
    const chips = db.chips.getAll();
    if (chips.some(c => c.customVariables)) {
        console.log('PASS: Chips have customVariables');
    }

    console.log('--- Test Complete ---');
}

testVariables().catch(console.error);
