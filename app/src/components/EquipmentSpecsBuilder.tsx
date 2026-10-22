import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sliders, ChevronDown } from 'lucide-react';

export type SpecType = 'text' | 'number' | 'boolean';

export interface SpecItem {
    id: string;
    key: string;
    type: SpecType;
    value: string | number | boolean;
    unit?: string;
}

interface EquipmentSpecsBuilderProps {
    value?: Record<string, any>;
    onChange: (specs: Record<string, any>) => void;
}

const COMMON_PRESETS = [
    { key: 'Potencia Nominal', type: 'number' as SpecType, unit: 'kVA', defaultValue: 150 },
    { key: 'Tensión de Salida', type: 'text' as SpecType, unit: 'V', defaultValue: '380/220V' },
    { key: 'Frecuencia', type: 'number' as SpecType, unit: 'Hz', defaultValue: 50 },
    { key: 'Factor de Potencia (cos phi)', type: 'number' as SpecType, unit: '', defaultValue: 0.8 },
    { key: 'Tipo de Combustible', type: 'text' as SpecType, unit: '', defaultValue: 'Diésel' },
    { key: 'Capacidad de Tanque', type: 'number' as SpecType, unit: 'Lts', defaultValue: 300 },
    { key: 'Capacidad de Aceite', type: 'number' as SpecType, unit: 'Lts', defaultValue: 25 },
    { key: 'Presión de Aceite Nominal', type: 'number' as SpecType, unit: 'bar', defaultValue: 4.5 },
    { key: 'Arranque Automático (ATS)', type: 'boolean' as SpecType, unit: '', defaultValue: true },
    { key: 'Módulo de Control / Tablero', type: 'text' as SpecType, unit: '', defaultValue: 'DeepSea 7320' },
];

export const EquipmentSpecsBuilder: React.FC<EquipmentSpecsBuilderProps> = ({ value = {}, onChange }) => {
    const [items, setItems] = useState<SpecItem[]>(() => {
        if (!value || Object.keys(value).length === 0) {
            return [];
        }
        return Object.entries(value).map(([k, v], idx) => {
            let type: SpecType = 'text';
            let val: any = v;
            let unit = '';

            if (typeof v === 'boolean') {
                type = 'boolean';
            } else if (typeof v === 'number') {
                type = 'number';
            } else if (typeof v === 'string') {
                // Check if string contains unit like "150 kVA"
                const match = v.match(/^([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z%°/]+)$/);
                if (match) {
                    type = 'number';
                    val = parseFloat(match[1]);
                    unit = match[2];
                }
            }

            return {
                id: `spec-${idx}-${Date.now()}`,
                key: k,
                type,
                value: val,
                unit,
            };
        });
    });

    const [showPresetsMenu, setShowPresetsMenu] = useState(false);

    // Sync to parent whenever items change
    const emitChanges = (updated: SpecItem[]) => {
        setItems(updated);
        const record: Record<string, any> = {};
        for (const item of updated) {
            const cleanKey = item.key.trim();
            if (!cleanKey) continue;

            if (item.type === 'number') {
                const num = typeof item.value === 'number' ? item.value : parseFloat(item.value as string);
                const safeNum = isNaN(num) ? 0 : num;
                record[cleanKey] = item.unit ? `${safeNum} ${item.unit}` : safeNum;
            } else if (item.type === 'boolean') {
                record[cleanKey] = Boolean(item.value);
            } else {
                record[cleanKey] = item.unit && item.value ? `${item.value} ${item.unit}` : item.value;
            }
        }
        onChange(record);
    };

    const handleAddItem = (preset?: typeof COMMON_PRESETS[0]) => {
        const newItem: SpecItem = preset ? {
            id: `spec-${Date.now()}-${Math.random()}`,
            key: preset.key,
            type: preset.type,
            value: preset.defaultValue,
            unit: preset.unit || '',
        } : {
            id: `spec-${Date.now()}-${Math.random()}`,
            key: '',
            type: 'text',
            value: '',
            unit: '',
        };

        emitChanges([...items, newItem]);
        setShowPresetsMenu(false);
    };

    const handleUpdateItem = (id: string, updates: Partial<SpecItem>) => {
        const updated = items.map(item => {
            if (item.id !== id) return item;
            const next = { ...item, ...updates };
            // Reset value on type switch if needed
            if (updates.type && updates.type !== item.type) {
                if (updates.type === 'boolean') next.value = true;
                else if (updates.type === 'number') next.value = 0;
                else next.value = '';
            }
            return next;
        });
        emitChanges(updated);
    };

    const handleRemoveItem = (id: string) => {
        emitChanges(items.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-[#333639]">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                    <Sliders className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ficha Técnica y Parámetros del Grupo</span>
                </div>
                <div className="relative flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-bold uppercase bg-slate-100 hover:bg-slate-200 dark:bg-[#141517] dark:hover:bg-[#25282c] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#333639] rounded-none transition-colors"
                    >
                        <span>Parámetros Frecuentes</span>
                        <ChevronDown className="w-3 h-3 text-amber-500" />
                    </button>
                    {showPresetsMenu && (
                        <div className="absolute right-0 top-7 z-30 w-64 bg-white dark:bg-[#1e2022] border border-slate-300 dark:border-[#333639] shadow-xl py-1 rounded-none text-left">
                            <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-slate-200 dark:border-[#333639]">
                                Plantillas electromecánicas
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                {COMMON_PRESETS.map((p, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleAddItem(p)}
                                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-500 font-mono transition-colors flex items-center justify-between"
                                    >
                                        <span>{p.key}</span>
                                        <span className="text-[10px] text-slate-400">{p.unit || p.type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => handleAddItem()}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-heading font-bold uppercase bg-amber-600 hover:bg-amber-500 text-white rounded-none transition-colors shadow-xs"
                    >
                        <Plus className="w-3 h-3" />
                        <span>+ Parámetro</span>
                    </button>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-slate-300 dark:border-[#333639] bg-slate-50 dark:bg-[#141517] rounded-none">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        No hay parámetros técnicos agregados. Pulsa <strong className="text-amber-500 font-bold">+ Parámetro</strong> o elige una plantilla rápida.
                    </p>
                </div>
            ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 bg-slate-50 dark:bg-[#141517] border border-slate-200 dark:border-[#333639] rounded-none"
                        >
                            {/* Param Name */}
                            <input
                                type="text"
                                placeholder="Nombre (ej: Potencia)"
                                value={item.key}
                                onChange={(e) => handleUpdateItem(item.id, { key: e.target.value })}
                                className="flex-1 min-w-[120px] text-xs p-1.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                            />

                            {/* Type Selector */}
                            <select
                                value={item.type}
                                onChange={(e) => handleUpdateItem(item.id, { type: e.target.value as SpecType })}
                                className="w-24 text-[11px] p-1.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 font-mono"
                            >
                                <option value="text">Texto</option>
                                <option value="number">Número</option>
                                <option value="boolean">Booleano</option>
                            </select>

                            {/* Value Input by Type */}
                            <div className="flex-1 min-w-[130px] flex items-center gap-1">
                                {item.type === 'boolean' ? (
                                    <select
                                        value={item.value ? 'true' : 'false'}
                                        onChange={(e) => handleUpdateItem(item.id, { value: e.target.value === 'true' })}
                                        className="w-full text-xs p-1.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    >
                                        <option value="true">Sí / Activo</option>
                                        <option value="false">No / Inactivo</option>
                                    </select>
                                ) : item.type === 'number' ? (
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="Valor numérico"
                                        value={item.value as number}
                                        onChange={(e) => handleUpdateItem(item.id, { value: parseFloat(e.target.value) })}
                                        className="w-full text-xs p-1.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="Valor"
                                        value={item.value as string}
                                        onChange={(e) => handleUpdateItem(item.id, { value: e.target.value })}
                                        className="w-full text-xs p-1.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 font-mono"
                                    />
                                )}

                                {/* Optional Unit (for text and number) */}
                                {item.type !== 'boolean' && (
                                    <input
                                        type="text"
                                        placeholder="Unidad (ej: kVA)"
                                        value={item.unit || ''}
                                        onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                                        className="w-18 text-[11px] p-1.5 rounded-none border border-slate-300 dark:border-[#333639] bg-white dark:bg-[#1e2022] text-slate-700 dark:text-slate-300 outline-none focus:border-amber-500 font-mono text-center"
                                    />
                                )}
                            </div>

                            {/* Delete button */}
                            <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-none"
                                title="Eliminar parámetro"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
