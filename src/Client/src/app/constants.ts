import { MatDateFormats, MAT_DATE_FORMATS } from '@angular/material/core';

export const ServiceTypes = [
    { value: '', text: '' },
    { value: 'Guida', text: 'Guida' },
    { value: 'Accompagnamento', text: 'Accompagnamento' },
    { value: 'Altro', text: 'Altro' },
];

export const DurationTypes = [
    { value: '', text: '' },
    { value: 'HalfDay', text: 'Half Day' },
    { value: 'FullDay', text: 'Full Day' },
    { value: 'Altro', text: 'Altro' },
];

export const Sexs = [
    { value: 'M', text: 'M' },
    { value: 'F', text: 'F' },
    { value: 'G', text: 'G' },
];

export const ContactTypes = [
    { value: 'Client', text: 'Client' },
    { value: 'Collaborator', text: 'Collaborator' },
];

export const DocumentTypes = [
    { value: '', text: '' },
    { value: 'FIV', text: 'FIV' },
    { value: 'FEI', text: 'FEI' },
    { value: 'FIVA', text: 'FIVA' },
    { value: 'RIT', text: 'RIT' },
];

export const ServiceTypesColor = {
    Guida: '#ef1616',
    Accompagnamento: '#444fd1',
};

export const MY_DATE_FORMATS: MatDateFormats = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'DD/MM/YYYY',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};
