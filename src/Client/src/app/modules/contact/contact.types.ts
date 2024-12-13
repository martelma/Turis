import { BaseSearchParameters } from 'app/shared/types/shared.types';
import { Language } from '../configuration/languages/language.types';

export class Contact {
    id: string;
    code: string;
    externalCode: string;
    title: string;
    sex: string;
    language: Language;
    firstName: string;
    lastName: string;
    fullName: string;
    fiscalCode: string;
    taxCode: string;
    companyName: string;
    birthDate: Date;
    birthDateText: string;
    birthPlace: string;
    address: string;
    city: string;
    cap: string;
    regionalCode: string;
    stateCode: string;
    phone1: string;
    phone2: string;
    fax: string;
    web: string;
    eMail: string;
    eMailAccounting: string;
    pec: string;
    sdiCode: string;
    note: string;
    documentType: string;
    contactType: string;
    percentageGuida: number;
    percentageAccompagnamento: number;

    bookmarkId: string;
}

export class ContactSearchParameters extends BaseSearchParameters {
    pattern?: string;
    code?: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    note?: string;
    onlyBookmarks?: boolean;
}
