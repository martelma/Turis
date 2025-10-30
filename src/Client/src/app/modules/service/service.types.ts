import { BaseSearchParameters } from 'app/shared/types/shared.types';
import { PriceList } from '../configuration/price-list/price-list.types';
import { Contact } from '../contact/contact.types';
import { Tag } from '../configuration/tags/tag.types';

export class Service {
    id: string;

    code: string;
    title: string;
    date: Date;
    dateText: string;
    timeText: string;
    start: Date;
    end: Date;
    serviceType: string;
    durationType: string;
    referent: string;
    referentPhone: string;
    note: string;
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
    attachmentsCount: number;

    billingStatus: string;
    commissionStatus: string;

    tags: Tag[] = [];

    selected: boolean;
    count: any;
}

export type Collaborator = Contact;

export class ServiceSearchParameters extends BaseSearchParameters {
    pattern?: string;
    onlyBookmarks?: boolean = false;
    code?: string;
    title?: string;
    location?: string;
    note?: string;
    serviceType?: string;
    durationType?: string;
    languages?: string[];
    status?: string;
    statuses?: string[];
    workflowCollaboratorStatus?: string;
    dateFrom?: string;
    dateTo?: string;
    collaboratorId?: string;
}

export class AccountStatementParameters extends BaseSearchParameters {
    contactId?: string;
    serviceType?: string;
    durationType?: string;
    dateFrom?: string;
    dateTo?: string;
}

export class ServiceEasy {
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
    // language: Language;
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

    billingStatus: string;
    commissionStatus: string;

    selected: boolean;
}

export class CalendarInfo {
    date: string | Date;
    count: number;
}
