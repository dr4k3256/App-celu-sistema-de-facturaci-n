import React from 'react';
import { useTranslation } from 'react-i18next';
import  { useEffect, useState } from 'react';
import { Save, ReceiptText } from 'lucide-react';
import { defaultInvoiceTemplate, getInvoiceTemplate, InvoiceTemplate, saveInvoiceTemplate, buildPOSTicket } from '../../infrastructure/invoiceTemplates';
import { useAlert } from '../context/AlertContext';

const InvoiceEditor = () => {
    const { t } = useTranslation();
    const { showToast } = useAlert();
    const [template, setTemplate] = useState<InvoiceTemplate>(defaultInvoiceTemplate);

    useEffect(() => {
        setTemplate(getInvoiceTemplate());
    }, []);

    const update = (field: keyof InvoiceTemplate, value: string | boolean | number) => {
        setTemplate(prev => ({ ...prev, [field]: value }));
    };

    const save = () => {
        saveInvoiceTemplate(template);
        showToast('Plantilla de facturación guardada', 'success');
    };

    const sampleSale: any = {
        id: 'FAC-EJEMPLO',
        registrationDate: new Date().toISOString(),
        clientName: 'Cliente General',
        total: 25000,
        items: [
            { productName: 'Producto ejemplo', variantDescription: 'Referencia', quantity: 2, unitPrice: 12500, subtotal: 25000 }
        ]
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2"><ReceiptText size={20} /> Editor de facturación</h2>
                    <p className="text-xs text-muted-foreground mt-1">Define el texto que saldrá en PDF y tirilla POS 80.</p>
                </div>
                <button onClick={save} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-2">
                    <Save size={16} /> Guardar
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass p-4 space-y-4">
                    {[
                        ['businessName', 'Nombre del negocio'],
                        ['nit', 'NIT'],
                        ['address', 'Dirección'],
                        ['phone', 'Teléfono'],
                        ['headerText', 'Texto superior'],
                        ['footerText', 'Texto final']
                    ].map(([field, label]) => (
                        <label key={field} className="block">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">{label}</span>
                            <input
                                className="w-full glass px-3 py-2 mt-1 text-sm outline-none"
                                value={String(template[field as keyof InvoiceTemplate] || '')}
                                onChange={e => update(field as keyof InvoiceTemplate, e.target.value)}
                            />
                        </label>
                    ))}
                    <label className="block">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Ancho de tirilla</span>
                        <input
                            type="number"
                            min={28}
                            max={42}
                            className="w-full glass px-3 py-2 mt-1 text-sm outline-none"
                            value={template.posWidth}
                            onChange={e => update('posWidth', Number(e.target.value))}
                        />
                    </label>
                    <label className="block">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Símbolo de Moneda</span>
                        <input
                            type="text"
                            maxLength={5}
                            className="w-full glass px-3 py-2 mt-1 text-sm outline-none"
                            value={template.currencySymbol || '$'}
                            onChange={e => update('currencySymbol', e.target.value)}
                        />
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                            ['showNit', 'Mostrar NIT'],
                            ['showClient', 'Mostrar cliente'],
                            ['showAddress', 'Mostrar dirección']
                        ].map(([field, label]) => (
                            <label key={field} className="glass px-3 py-2 text-xs flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={Boolean(template[field as keyof InvoiceTemplate])}
                                    onChange={e => update(field as keyof InvoiceTemplate, e.target.checked)}
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="glass p-4">
                    <h3 className="font-bold text-sm mb-3">Vista previa POS 80</h3>
                    <pre className="bg-white text-black rounded-lg p-4 overflow-auto text-[11px] leading-4 font-mono whitespace-pre-wrap min-h-[360px]">
                        {buildPOSTicket(sampleSale, template)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default InvoiceEditor;
