import { Collaborator, Service } from 'app/modules/service/service.types';
import { BaseSearchParameters } from 'app/shared/types/shared.types';

export class Payment {
    id: string;
    date: Date;
    number: string;
    collaboratorId: string;
    collaborator: Collaborator;
    vatRate: number;
    vat: number;
    withholdingTaxRate: number;
    withholdingTax: number;
    amount: number;
    total: number;
    note: string;

    bookmarkId: string;
    selected: boolean;

    items: PaymentItem[] = [];
}

export class PaymentSearchParameters extends BaseSearchParameters {
    pattern?: string;
    onlyBookmarks?: boolean;
    dateFrom?: string;
    dateTo?: string;
}

export class PaymentItem {
    id: string;
    paymentId: string;
    serviceId: string;
    service: Service;
}
