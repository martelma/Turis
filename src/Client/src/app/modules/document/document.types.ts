import { Contact } from 'app/modules/contact/contact.types';
import { BaseSearchParameters } from 'app/shared/types/shared.types';

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
    cig: string;
    cup: string;

    bookmarkId: string;
}

export class DocumentSearchParameters extends BaseSearchParameters {
    pattern?: string;
    onlyBookmarks?: boolean;
    dateFrom?: string;
    dateTo?: string;
    documentType?: string;
    sectional?: string;
    numberFrom?: number;
    numberTo?: number;
}
