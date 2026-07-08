import { Sale } from '../domain/models';

export type InvoiceTemplate = {
    businessName: string;
    nit: string;
    address: string;
    phone: string;
    headerText: string;
    footerText: string;
    posWidth: number;
    showNit: boolean;
    showClient: boolean;
    showAddress: boolean;
    currencySymbol: string;
};

const TEMPLATE_KEY = 'sistema_facturacion_invoice_template_v1';

export const defaultInvoiceTemplate: InvoiceTemplate = {
    businessName: 'Facturador',
    nit: '',
    address: '',
    phone: '',
    headerText: 'Factura de venta',
    footerText: 'Gracias por su compra',
    posWidth: 32,
    showNit: true,
    showClient: true,
    showAddress: true,
    currencySymbol: '$'
};

export const getInvoiceTemplate = (): InvoiceTemplate => {
    const raw = localStorage.getItem(TEMPLATE_KEY);
    if (!raw) return defaultInvoiceTemplate;
    try {
        return { ...defaultInvoiceTemplate, ...JSON.parse(raw) };
    } catch {
        return defaultInvoiceTemplate;
    }
};

export const saveInvoiceTemplate = (template: InvoiceTemplate) => {
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(template));
};

export const formatMoney = (value: number, customSymbol?: string) => {
    const sym = customSymbol || getInvoiceTemplate().currencySymbol || '$';
    return `${sym} ${Number(value || 0).toLocaleString('es-CO')}`;
};

const money = (value: number) => formatMoney(value);
const center = (text: string, width: number) => {
    const clean = text.slice(0, width);
    const left = Math.max(0, Math.floor((width - clean.length) / 2));
    return `${' '.repeat(left)}${clean}`;
};

export const buildPOSTicket = (sale: Sale, template = getInvoiceTemplate()) => {
    const width = Number(template.posWidth) || 32;
    const line = '-'.repeat(width);
    const rows = [
        center(template.businessName, width),
        template.nit && template.showNit ? center(`NIT: ${template.nit}`, width) : '',
        template.address && template.showAddress ? center(template.address, width) : '',
        template.phone ? center(`Tel: ${template.phone}`, width) : '',
        line,
        template.headerText,
        `Factura: ${sale.id}`,
        `Fecha: ${new Date(sale.registrationDate).toLocaleString('es-CO')}`,
        template.showClient ? `Cliente: ${sale.clientName || 'Cliente General'}` : '',
        line,
        ...sale.items.flatMap(item => [
            item.productName,
            `${item.quantity} x ${money(item.unitPrice)} = ${money(item.subtotal || item.quantity * item.unitPrice)}`
        ]),
        line,
        `TOTAL: ${money(sale.total)}`,
        line,
        center(template.footerText, width)
    ];
    return rows.filter(Boolean).join('\n');
};

export const buildInvoiceHtml = (sale: Sale, template = getInvoiceTemplate(), pos = false) => {
    const rows = sale.items.map(item => `
        <tr>
            <td>${item.productName}<br><small>${item.variantDescription || ''}</small></td>
            <td>${item.quantity}</td>
            <td>${money(item.unitPrice)}</td>
            <td>${money(item.subtotal || item.quantity * item.unitPrice)}</td>
        </tr>
    `).join('');
    const pageStyle = pos ? '@page{size:80mm auto;margin:0} body{width:72mm;margin:4mm auto;font-size:11px}' : '@page{size:auto;margin:14mm} body{font-size:13px}';
    return `<!doctype html><html><head><meta charset="utf-8"><title>${sale.id}</title><style>
        ${pageStyle}
        body{font-family:Arial,Helvetica,sans-serif;color:#111;background:#fff}
        h1,h2,p{margin:0 0 6px}
        .center{text-align:center}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th,td{border-bottom:1px solid #ddd;padding:6px;text-align:left;vertical-align:top}
        th:nth-child(n+2),td:nth-child(n+2){text-align:right}
        .total{font-size:18px;font-weight:700;text-align:right;margin-top:12px}
        small{color:#555}
    </style></head><body>
        <section class="center">
            <h1>${template.businessName}</h1>
            ${template.showNit && template.nit ? `<p>NIT: ${template.nit}</p>` : ''}
            ${template.showAddress && template.address ? `<p>${template.address}</p>` : ''}
            ${template.phone ? `<p>Tel: ${template.phone}</p>` : ''}
            <h2>${template.headerText}</h2>
        </section>
        <p><strong>Factura:</strong> ${sale.id}</p>
        <p><strong>Fecha:</strong> ${new Date(sale.registrationDate).toLocaleString('es-CO')}</p>
        ${template.showClient ? `<p><strong>Cliente:</strong> ${sale.clientName || 'Cliente General'}</p>` : ''}
        <table>
            <thead><tr><th>Producto</th><th>Cant.</th><th>Valor</th><th>Total</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
        <p class="total">Total: ${money(sale.total)}</p>
        <p class="center">${template.footerText}</p>
    </body></html>`;
};
