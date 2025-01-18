import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JournalEntry, JournalEntrySearchParameters } from '../journal-entry/journal-entry.types';
import { BaseEntityService } from 'app/shared/services';
import { BehaviorSubject, filter, finalize, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';

@Injectable({ providedIn: 'root' })
export class JournalEntryService extends BaseEntityService<JournalEntry> {
    private _journalEntries: BehaviorSubject<PaginatedListResult<JournalEntry>> = new BehaviorSubject(null);
    private _journalEntry: BehaviorSubject<JournalEntry> = new BehaviorSubject(null);
    private _journalEntryEdited: BehaviorSubject<string> = new BehaviorSubject(null);
    private _journalEntriesLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _queryParameters: BehaviorSubject<JournalEntrySearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(http: HttpClient) {
        super(http);
        this.defaultApiController = 'journal-entry';
    }

    /**
     * Getter for journalEntrys
     */
    get journalEntries$(): Observable<PaginatedListResult<JournalEntry>> {
        return this._journalEntries.asObservable();
    }

    /**
     * Getter for journalEntry
     */
    get journalEntry$(): Observable<JournalEntry> {
        return this._journalEntry.asObservable();
    }

    /**
     * Getter for journalEntrys loading
     */
    get journalEntriesLoading$(): Observable<boolean> {
        return this._journalEntriesLoading.asObservable();
    }

    /**
     * Getter for journalEntry edited
     */
    get journalEntryEdited$(): Observable<string> {
        return this._journalEntryEdited.asObservable();
    }

    /**
     * Getter for query parameters
     */
    get journalEntryParameters$(): Observable<JournalEntrySearchParameters> {
        return this._queryParameters.asObservable();
    }

    /**
     * Get a journalEntry identified by the given journalEntry id
     */
    getById(id: string): Observable<JournalEntry> {
        return this.getSingle(id).pipe(
            map(journalEntry => {
                this._journalEntry.next(journalEntry);

                return journalEntry;
            }),
        );
    }

    /**
     * Create a dummy journalEntry
     */
    createEntity(): Observable<JournalEntry> {
        return this.journalEntries$.pipe(
            take(1),
            switchMap(journalEntrys =>
                of({
                    id: emptyGuid,
                    userId: undefined,
                    timeStamp: undefined,
                    date: undefined,
                    amount: undefined,
                    description: undefined,
                    bookmarkId: undefined,
                }).pipe(
                    map(newJournalEntry => {
                        // Update the journalEntrys with the new journalEntry
                        this._journalEntries.next({
                            ...journalEntrys,
                            items: [newJournalEntry, ...journalEntrys.items],
                        });

                        // Return the new journalEntry
                        return newJournalEntry;
                    }),
                ),
            ),
        );
    }

    /**
     * Update journalEntry
     *
     * @param id
     * @param journalEntry
     */
    updateEntity(id: string, journalEntry: JournalEntry): Observable<JournalEntry> {
        return this.journalEntries$.pipe(
            take(1),
            switchMap(journalEntrys =>
                this.create(journalEntry).pipe(
                    map(() => {
                        // Find the index of the updated journalEntry
                        const index = journalEntrys.items.findIndex(item => item.id === id);

                        // Update the journalEntry
                        journalEntrys[index] = journalEntry;

                        // Update the journalEntry
                        this._journalEntry.next(journalEntry);

                        // Return the updated journalEntry
                        return journalEntry;
                    }),
                    switchMap(updatedJournalEntry =>
                        this.journalEntry$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the journalEntry if it's selected
                                this._journalEntry.next(updatedJournalEntry);

                                // Return the updated journalEntry
                                return updatedJournalEntry;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Gets all journalEntrys
     * @returns
     */
    listEntities(params?: JournalEntrySearchParameters): Observable<PaginatedListResult<JournalEntry>> {
        this._journalEntriesLoading.next(true);

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
                this._journalEntries.next(list);

                this._queryParameters.next({
                    ...this._queryParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._journalEntriesLoading.next(false);
            }),
        );
    }

    /**
     * Delete the journalEntry identified by the given id
     * @param id
     * @returns
     */
    deleteEntity(id: string): Observable<JournalEntry> {
        return this._journalEntries.pipe(
            take(1),
            switchMap(journalEntrys => {
                // Remove the journalEntry
                this._journalEntry.next(null);

                // Remove the journalEntry from the _journalEntrys
                this._journalEntries.next({
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

    editJournalEntry(journalEntryId: string): void {
        this._journalEntryEdited.next(journalEntryId);
    }
}
