import { BaseSearchParameters } from 'app/shared/types/shared.types';
import { Language } from 'highlight.js';
import { PriceList } from '../configuration/price-list/price-list.types';
import { Contact } from '../contact/contact.types';

export class Service {
    id: string;

    code: string;
    title: string;
    date: Date;
    dateText: string;
    start: Date;
    end: Date;
    serviceType: string;
    durationType: string;
    referent: string;
    referentPhone: string;
    note: string;
    language: Language;
    languages: string[] = [];
    userId: string;
    creationDate: Date;
    status: string;
    workflowCollaboratorStatus: string;
    optionExpiration: Date;
    optionExpirationText: string;
    location: string;
    meetingPlace: string;
    people: number;
    checked: boolean;
    priceListId: string;
    priceList: PriceList;
    priceCalculated: number;
    price: number;
    clientId: string;
    client: Contact;
    collaboratorId: string;
    collaborator: Collaborator;
    cIGCode: string;
    cUPCode: string;
    cashedIn: boolean;
    cashedDate: Date;

    commissionPercentage: number;
    commissionCalculated: number;
    commission: number;
    commissionNote: string;
    commissionPaid: boolean;
    commissionPaymentDate: Date;

    bookmarkId: string;
}

export type Collaborator = Contact;

export class ServiceSearchParameters extends BaseSearchParameters {
    pattern?: string;
    onlyBookmarks?: boolean = false;
    code?: string;
    title?: string;
    note?: string;
    serviceType?: string;
    durationType?: string;
    languages?: string[];
    dateFrom?: string;
    dateTo?: string;
}
