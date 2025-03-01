import { BaseSearchParameters } from 'app/shared/types/shared.types';

export class JournalEntry {
    id: string;
    userId: string;
    userFullName: string;
    timeStamp: Date;
    date: Date;
    description: string;
    note: string;
    amount: number;
    balance: number;

    bookmarkId: string;

    selected: boolean;
}

export class JournalEntrySearchParameters extends BaseSearchParameters {
    pattern?: string;
    onlyBookmarks?: boolean;
    dateFrom?: string;
    dateTo?: string;
}
