import { BaseSearchParameters } from 'app/shared/types/shared.types';

export class JournalEntry {
    id: string;
    userId: string;
    timeStamp: Date;
    date: Date;
    description: string;
    amount: number;

    bookmarkId: string;
}

export class JournalEntrySearchParameters extends BaseSearchParameters {
    pattern?: string;
    onlyBookmarks?: boolean;
    dateFrom?: string;
    dateTo?: string;
}
