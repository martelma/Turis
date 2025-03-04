import { BaseSearchParameters } from 'app/shared/types/shared.types';
import { SafeUrl } from '@angular/platform-browser';
import { Tag } from '../configuration/tags/tag.types';

export class Contact {
    id: string;
    code: string;
    externalCode: string;
    title: string;
    sex: string;
    // language: Language;
    languages: string[] = [];
    firstName: string;
    lastName: string;
    fullName: string;
    displayName: string;
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
    avatar?: string;
    avatarUrl?: SafeUrl;
    avatarUrl2?: SafeUrl;

    tags: Tag[] = [];

    bookmarkId: string;

    selected: boolean;
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
