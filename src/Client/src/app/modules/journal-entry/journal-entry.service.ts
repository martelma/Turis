import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JournalEntry, JournalEntrySearchParameters } from '../journal-entry/journal-entry.types';
import { BaseEntityService } from 'app/shared/services';
import { BehaviorSubject, filter, finalize, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';
import { JournalEntrySummary, SummaryData } from '../admin/dashboard/dashboard.types';

@Injectable({ providedIn: 'root' })
export class JournalEntryService extends BaseEntityService<JournalEntry> {
    private _edited: BehaviorSubject<string> = new BehaviorSubject(null);

    private _journalEntrySummary: BehaviorSubject<SummaryData> = new BehaviorSubject(null);

    private _list: BehaviorSubject<PaginatedListResult<JournalEntry>> = new BehaviorSubject(null);
    private _item: BehaviorSubject<JournalEntry> = new BehaviorSubject(null);
    private _loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _parameters: BehaviorSubject<JournalEntrySearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });

    constructor(http: HttpClient) {
        super(http);
        this.defaultApiController = 'journal-entry';
    }

    get journalEntrySummary$(): Observable<SummaryData> {
        return this._journalEntrySummary.asObservable();
    }

    get list$(): Observable<PaginatedListResult<JournalEntry>> {
        return this._list.asObservable();
    }

    get item$(): Observable<JournalEntry> {
        return this._item.asObservable();
    }

    get loading$(): Observable<boolean> {
        return this._loading.asObservable();
    }

    get edited$(): Observable<string> {
        return this._edited.asObservable();
    }

    get parameters$(): Observable<JournalEntrySearchParameters> {
        return this._parameters.asObservable();
    }

    getById(id: string): Observable<JournalEntry> {
        return this.getSingle(id).pipe(
            map(journalEntry => {
                this._item.next(journalEntry);

                return journalEntry;
            }),
        );
    }

    createEntity(): Observable<JournalEntry> {
        const item: JournalEntry = {
            id: undefined,
            userId: '',
            userFullName: '',
            timeStamp: new Date(),
            date: new Date(),
            description: '',
            note: '',
            amount: 0,
            balance: 0,

            tags: [],

            bookmarkId: '',

            selected: false,
        };

        this._item.next(item);

        return of(item);
    }

    updateEntity(id: string, journalEntry: JournalEntry): Observable<JournalEntry> {
        return this.list$.pipe(
            take(1),
            switchMap(journalEntrys =>
                this.create(journalEntry).pipe(
                    map(() => {
                        // Find the index of the updated journalEntry
                        const index = journalEntrys.items.findIndex(item => item.id === id);

                        // Update the journalEntry
                        journalEntrys[index] = journalEntry;

                        // Update the journalEntry
                        this._item.next(journalEntry);

                        // Return the updated journalEntry
                        return journalEntry;
                    }),
                    switchMap(updatedJournalEntry =>
                        this.item$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the journalEntry if it's selected
                                this._item.next(updatedJournalEntry);

                                // Return the updated journalEntry
                                return updatedJournalEntry;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    listEntities(params?: JournalEntrySearchParameters): Observable<PaginatedListResult<JournalEntry>> {
        this._loading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        httpParams = httpParams.append('onlyBookmarks', params?.onlyBookmarks ? 'true' : 'false');
        httpParams = httpParams.append('dateFrom', params?.dateFrom ?? '');
        httpParams = httpParams.append('dateTo', params?.dateTo ?? '');
        const queryString = httpParams.toString();

        const url = `?${queryString}`;

        return this.apiGet<PaginatedListResult<JournalEntry>>(url).pipe(
            map((list: PaginatedListResult<JournalEntry>) => {
                this._list.next(list);

                this._parameters.next({
                    ...this._parameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._loading.next(false);
            }),
        );
    }

    deleteEntity(id: string): Observable<JournalEntry> {
        return this._list.pipe(
            take(1),
            switchMap(journalEntrys => {
                // Remove the journalEntry
                this._item.next(null);

                // Remove the journalEntry from the _journalEntrys
                this._list.next({
                    ...journalEntrys,
                    items: journalEntrys.items.filter(item => item.id !== id),
                });

                // Return the journalEntry
                return this.delete(id);
            }),
            switchMap(journalEntry => {
                if (!journalEntry) {
                    return throwError('Could not found journalEntry with id of ' + id + '!');
                }

                return of(journalEntry);
            }),
        );
    }

    editEntity(id: string): void {
        this._edited.next(id);
    }

    yearSummary(year: number): Observable<SummaryData> {
        this._loading.next(true);

        const url = `year-summary/${year}`;

        return this.apiGet<SummaryData>(url).pipe(
            map((data: SummaryData) => {
                this._journalEntrySummary.next(data);

                return data;
            }),
            finalize(() => {
                this._loading.next(false);
            }),
        );
    }

    periodSummary(period: string): Observable<SummaryData> {
        this._loading.next(true);

        const url = `period-summary/${period}`;

        return this.apiGet<SummaryData>(url).pipe(
            map((data: SummaryData) => {
                this._journalEntrySummary.next(data);

                return data;
            }),
            finalize(() => {
                this._loading.next(false);
            }),
        );
    }

    // summary(): Observable<JournalEntrySummary> {
    //     this._loading.next(true);

    //     const url = `summary`;

    //     return this.apiGet<JournalEntrySummary>(url).pipe(
    //         map((data: JournalEntrySummary) => {
    //             this._journalEntrySummary.next(data);

    //             return data;
    //         }),
    //         finalize(() => {
    //             this._loading.next(false);
    //         }),
    //     );
    // }
}
