import { Service } from 'app/modules/service/service.types';
import { Document } from 'app/modules/document/document.types';
import { MatDateFormats, MAT_DATE_FORMATS } from '@angular/material/core';
import { DateFormats } from './shared/services/shared.types';

export type EventLogViewMode = 'grid' | 'activities';

export const ServiceTypes = [
    // { value: '', text: '' },
    { value: 'Guida', text: 'Guida' },
    { value: 'Accompagnamento', text: 'Accompagnamento' },
    { value: 'Altro', text: 'Altro' },
];

export const DurationTypes = [
    // { value: '', text: '' },
    { value: 'FullDay', text: 'Full Day' },
    { value: 'HalfDay', text: 'Half Day' },
    { value: 'Altro', text: 'Altro' },
];

export const StatusTypes = [
    { value: 'New', text: 'New', colorClass: 'bg-gray-500' },
    { value: 'Confirmed', text: 'Confirmed', colorClass: 'bg-yellow-500' },
    { value: 'Closed', text: 'Closed', colorClass: 'bg-green-500' },
    { value: 'Option', text: 'Option', colorClass: 'bg-orange-500' },
    { value: 'Cancelled', text: 'Cancelled', colorClass: 'bg-red-500' },
];

export const WorkflowCollaboratorStatusTypes = [
    { value: 'ToBeCommunicated', text: 'ToBeCommunicated', colorClass: 'bg-red-500' },
    { value: 'Pending', text: 'Pending', colorClass: 'bg-yellow-500' },
    { value: 'Confirmed', text: 'Confirmed', colorClass: 'bg-green-500' },
];

export const EsigibilitaIVATypes = [
    { value: 'I', text: 'IVA ad esigibilità immediata' },
    { value: 'D', text: 'IVA ad esigibilità differita' },
    { value: 'S', text: 'Scissione dei pagamenti' },
];

export const BillingStatusTypes = [
    { value: 'CashedIn', text: 'Cashed In', colorClass: 'bg-green-500' },
    { value: 'ToBeCashed', text: 'To Be Cashed', colorClass: 'bg-yellow-500' },
    { value: 'ToBeInvoiced', text: 'To Be Invoiced', colorClass: 'bg-red-500' },
];

export const CommissionStatusTypes = [
    { value: 'Paid', text: 'Paid', colorClass: 'bg-green-500' },
    { value: 'ToBePaid', text: 'To Be Paid', colorClass: 'bg-yellow-500' },
];

export const DocumentStatus = [
    { value: 'Issued', text: 'Issued', colorClass: 'bg-green-500' },
    { value: 'Preview', text: 'Preview', colorClass: 'bg-yellow-500' },
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
    { value: 'N', text: 'N' },
    { value: 'FEE', text: 'FEE' },
    { value: 'F', text: 'F' },
    { value: 'FEI', text: 'FEI' },
    { value: 'FEI2', text: 'FEI2' },
    { value: 'FIVA', text: 'FIVA' },
    { value: 'RIT', text: 'RIT' },
];

export const ServiceTypesColor = {
    Guida: '#ef1616',
    Accompagnamento: '#444fd1',
};

export const AppSettings = {
    HomePage: 'HomePage',
    Calendar: 'Calendar',
    Contact: 'Contact',
    Service: 'Service',
    Document: 'Document',
    Payment: 'Payment',
    JournalEntry: 'JournalEntry',
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

export const UserDateFormats: DateFormats = {
    date: 'dd/MM/yyyy',
    dateTime: 'dd/MM/yyyy HH:mm',
    dateTimeWithSeconds: 'dd/MM/yyyy HH:mm:ss',
    time: 'HH:mm',
    timeWithSeconds: 'HH:mm:ss',
};

export function getStatusColorClass(item: Service) {
    return StatusTypes.find(x => x.value === item?.status)?.colorClass || 'bg-default';
}

export function getStatusText(item: Service) {
    return StatusTypes.find(x => x.value === item?.status)?.text || '';
}

export function getWorkflowCollaboratorStatusColorClass(item: Service) {
    return (
        WorkflowCollaboratorStatusTypes.find(x => x.value === item?.workflowCollaboratorStatus)?.colorClass ||
        'bg-default'
    );
}

export function getWorkflowCollaboratorStatusText(item: Service) {
    return WorkflowCollaboratorStatusTypes.find(x => x.value === item?.workflowCollaboratorStatus)?.text || '';
}

export function getBillingStatusColorClass(item: Service) {
    return BillingStatusTypes.find(x => x.value === item?.billingStatus)?.colorClass || 'bg-default';
}

export function getBillingStatusText(item: Service) {
    return BillingStatusTypes.find(x => x.value === item?.billingStatus)?.text || '';
}

export function getCommissionStatusColorClass(item: Service) {
    return CommissionStatusTypes.find(x => x.value === item?.commissionStatus)?.colorClass || 'bg-default';
}

export function getCommissionStatusText(item: Service) {
    return CommissionStatusTypes.find(x => x.value === item?.commissionStatus)?.text || '';
}

export function getDocumentStatusColorClass(item: Document) {
    return DocumentStatus.find(x => x.value === item?.status)?.colorClass || 'bg-default';
}

export function getDocumentStatusText(item: Document) {
    return DocumentStatus.find(x => x.value === item?.status)?.text || '';
}
