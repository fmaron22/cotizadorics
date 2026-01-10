"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { History, Pencil, Trash2, Plus } from "lucide-react";
import {
    updateMaterial, updateChip, updateProcess, updateSecurityFeature,
    createMaterial, createChip, createProcess, createSecurityFeature
} from "@/app/actions";
import { useRouter } from "next/navigation";

// Interface for props. In a real app, I'd use generics more strictly or Zod.
interface CatalogTableProps {
    data: any[];
    type: 'material' | 'chip' | 'process' | 'feature';
}

const COLUMN_DEFS: Record<string, string[]> = {
    material: ['tipo', 'espesorMicras', 'costoUnitarioUsd', 'proveedor', 'leadTimeWeeks', 'diasCreditoProveedor', 'customVariables'],
    chip: ['modelo', 'interfaz', 'costoUnitario', 'diasCreditoProveedor', 'leadTime', 'customVariables'],
    process: ['nombreEtapa', 'costoHoraOperador', 'costoEnergia', 'setupTimeHours', 'runSpeedSheetsPerHour', 'setupScrapSheets', 'scrapRate', 'customVariables'],
    feature: ['nombre', 'unidadMedida', 'costoPorUnidad', 'rendimientoPorUnidad', 'insumoRequerido', 'customVariables']
};

export function CatalogTable({ data, type }: CatalogTableProps) {
    const router = useRouter();
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);

    // Use explicit columns instead of inference
    const columns = COLUMN_DEFS[type] || [];

    const handleEdit = (item: any) => {
        setIsCreating(false);
        // Ensure customVariables is an object
        setEditingItem({
            ...item,
            customVariables: item.customVariables || {}
        });
    };

    const handleCreate = () => {
        setIsCreating(true);
        // Initialize empty item based on columns
        const newItem: any = { id: crypto.randomUUID() }; // Mock ID generation client side or let server do it. MockDB expects ID.
        columns.forEach(col => {
            if (col === 'customVariables') newItem[col] = {};
            else newItem[col] = ''; // Default empty string
        });
        setEditingItem(newItem);
    };

    const handleSave = async () => {
        if (!editingItem) return;
        setLoading(true);
        try {
            if (isCreating) {
                if (type === 'material') await createMaterial(editingItem);
                else if (type === 'chip') await createChip(editingItem);
                else if (type === 'process') await createProcess(editingItem);
                else if (type === 'feature') await createSecurityFeature(editingItem);
            } else {
                if (type === 'material') await updateMaterial(editingItem.id, editingItem);
                else if (type === 'chip') await updateChip(editingItem.id, editingItem);
                else if (type === 'process') await updateProcess(editingItem.id, editingItem);
                else if (type === 'feature') await updateSecurityFeature(editingItem.id, editingItem);
            }

            setEditingItem(null);
            setIsCreating(false);
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Error saving");
        } finally {
            setLoading(false);
        }
    };

    const handleHistory = async (id: string) => {
        alert("Historial no implementado en esta vista rápida.");
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Item
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map(col => (
                            <TableHead key={col} className="capitalize">{col.replace(/([A-Z])/g, " $1")}</TableHead>
                        ))}
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id}>
                            {columns.map(col => (
                                <TableCell key={col} className="max-w-[200px] truncate">
                                    {col === 'customVariables' ? (
                                        <div className="flex gap-1 flex-wrap">
                                            {item[col] && Object.keys(item[col]).length > 0 ? (
                                                Object.entries(item[col]).map(([k, v]) => (
                                                    <span key={k} className="px-1.5 py-0.5 bg-orange-100 text-orange-800 text-[10px] rounded-full border border-orange-200">
                                                        {k}: {String(v)}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">Sin variables</span>
                                            )}
                                        </div>
                                    ) : (
                                        typeof item[col] === 'object' ? JSON.stringify(item[col]) : item[col]
                                    )}
                                </TableCell>
                            ))}
                            <TableCell className="text-right space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleHistory(item.id)}>
                                    <History className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Edit/Create Dialog */}
            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{isCreating ? 'Nuevo Registro' : 'Editar Registro'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto px-1">
                        {editingItem && columns.map(col => {
                            const isJsonField = col === 'customVariables';
                            const currentValue = editingItem[col];

                            return (
                                <div key={col} className="grid grid-cols-1 gap-2">
                                    <Label className="capitalize text-sm font-semibold text-slate-700">{col.replace(/([A-Z])/g, " $1")}</Label>

                                    {isJsonField ? (
                                        <div className="border rounded-md p-4 bg-slate-50">
                                            <VariableEditor
                                                values={currentValue}
                                                onChange={(newVal) => setEditingItem({ ...editingItem, [col]: newVal })}
                                            />
                                        </div>
                                    ) : (
                                        <Input
                                            value={currentValue ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                                                setEditingItem({ ...editingItem, [col]: val });
                                            }}
                                            type={typeof data[0]?.[col] === 'number' || col.includes('costo') || col.includes('Micras') ? 'number' : 'text'}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? (isCreating ? "Creando..." : "Guardando...") : (isCreating ? "Crear" : "Guardar Cambios")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Visual Key-Value Editor
function VariableEditor({ values, onChange }: { values: Record<string, any>, onChange: (val: Record<string, any>) => void }) {
    const entries = Object.entries(values || {});
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");

    const handleAdd = () => {
        if (!newKey.trim()) return;
        const updated = { ...values, [newKey.trim()]: newValue };
        onChange(updated);
        setNewKey("");
        setNewValue("");
    };

    const handleRemove = (keyToRemove: string) => {
        const { [keyToRemove]: _, ...rest } = values;
        onChange(rest);
    };

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                {entries.map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                        <div className="grid grid-cols-2 gap-2 flex-1">
                            <Input value={key} disabled className="bg-white h-8 text-xs font-mono" />
                            <Input value={String(val)} disabled className="bg-white h-8 text-xs" />
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemove(key)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                {entries.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No hay variables definidas.</p>}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t mt-2">
                <Input
                    placeholder="Nombre variable (ej. Color)"
                    value={newKey}
                    onChange={e => setNewKey(e.target.value)}
                    className="h-8 text-sm"
                />
                <Input
                    placeholder="Valor (ej. Rojo)"
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    className="h-8 text-sm"
                />
                <Button size="sm" onClick={handleAdd} disabled={!newKey.trim()} title="Agregar Variable">
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                </Button>
            </div>
        </div>
    );
}
