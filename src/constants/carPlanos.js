export const CATEGORIAS = [
    { value: 'diario',     label: 'Diário' },
    { value: 'semanal',    label: 'Semanal' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral',  label: 'Semestral' },
    { value: 'anual',      label: 'Anual' },
];

export const CATEGORIAS_POR_TIPO = {
    particular:  ['diario', 'semanal', 'trimestral', 'semestral', 'anual'],
    motorista:   ['trimestral', 'semestral', 'anual'],
    corporativo: ['semanal', 'trimestral', 'semestral', 'anual'],
};

export const KM_OPCOES = [
    { value: 0,    label: 'KM Livre' },
    { value: 1000, label: '1.000 KM' },
    { value: 2000, label: '2.000 KM' },
    { value: 2500, label: '2.500 KM' },
    { value: 5000, label: '5.000 KM' },
];
