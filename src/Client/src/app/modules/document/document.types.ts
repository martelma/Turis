import { Contact } from 'app/modules/contact/contact.types';
import { BaseSearchParameters } from 'app/shared/types/shared.types';
import { Service } from '../service/service.types';
import { AliquotaIva } from '../configuration/aliquote-iva/aliquota-iva.types';

export class Document {
    id: string;
    documentRefId: string;
    documentRef: Document;
    type: string;
    status: string;
    clientId: string;
    client: Contact;
    idSdi: string;
    date: Date;
    sectional: string;
    number: number;
    discountPercentage: number;
    discount: number;
    amount: number;
    vatRate: number;
    vat: number;
    aliquotaRitenutaDiAcconto: number;
    ritenutaDiAcconto: number;
    totalExemptExpenses: number;
    totalExpenses: number;
    total: number;
    importoBollo: number;
    desTipoPagamento: string;
    saldato: boolean;
    dataIncasso: Date;
    collaboratorId: string;
    collaborator: Contact;
    sdiCodiceTipoPagamento: string;
    sdiValoreTipoPagamento: string;
    sdiCodiceCondizionePagamento: string;
    dataScadenzaPagamento: Date;
    idDocumento: string;
    cig: string;
    cup: string;

    bookmarkId: string;

    selected: boolean;

    items: DocumentItem[] = [];
}

export class DocumentSearchParameters extends BaseSearchParameters {
    pattern?: string;
    onlyBookmarks?: boolean;
    documentType?: string;
    sectional?: string;
    numberFrom?: number;
    numberTo?: number;
    dateFrom?: string;
    dateTo?: string;
}

export class DocumentItem {
    id: string;
    documentId: string;
    document: Document;
    serviceId: string;
    service: Service;
    row: number;
    code: string;
    description: string;
    codiceNatura: string;
    riferimentoNormativo: string;
    quantity: number;
    price: number;
    discountPercentage: number;
    rowAmount: number;
    codiceEsigibilitaIVA: number;
    vat: AliquotaIva = null;
    vatRate: number;
    vatAmount: number;
}

export class ClientBillingSummary {
    client: Contact;
    serviceCount: number;
    totalAmount: number;
}
