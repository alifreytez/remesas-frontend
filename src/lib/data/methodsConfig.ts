export const countriesMethods: Record<string, string[]> = {
    '1': ['pago_movil', 'transferencia'], // Venezuela
    '2': ['transferencia', 'nequi'], // Colombia
    '3': ['transferencia'], // Peru
    '4': ['transferencia']  // Chile
};

export const methodsConfig: Record<string, any> = {
    'pago_movil': {
        name: 'Pago Móvil',
        fields: [
            { name: 'bank', label: 'Banco', type: 'text', required: true },
            { name: 'document', label: 'Cédula del Titular', type: 'text', required: true },
            { name: 'phone', label: 'Teléfono Afiliado', type: 'text', required: true }
        ]
    },
    'transferencia': {
        name: 'Transferencia Bancaria',
        fields: [
            { name: 'bank', label: 'Banco', type: 'text', required: true },
            { name: 'accountNumber', label: 'Número de Cuenta', type: 'text', required: true },
            { name: 'document', label: 'Documento del Titular', type: 'text', required: true }
        ]
    },
    'nequi': {
        name: 'Nequi',
        fields: [
            { name: 'phone', label: 'Número Nequi', type: 'text', required: true }
        ]
    }
};
