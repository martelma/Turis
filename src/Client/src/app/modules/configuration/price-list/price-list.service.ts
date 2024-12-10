import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, filter, finalize, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { BaseEntityService } from 'app/shared/services';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';
import { PriceList, PriceListSearchParameters } from './price-list.types';

@Injectable({ providedIn: 'root' })
export class PriceListService extends BaseEntityService<PriceList> {
    private _priceLists: BehaviorSubject<PaginatedListResult<PriceList>> = new BehaviorSubject(null);
    private _priceList: BehaviorSubject<PriceList> = new BehaviorSubject(null);
    private _priceListsLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _queryParameters: BehaviorSubject<PriceListSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(http: HttpClient) {
        super(http);
        this.defaultApiController = 'priceList';
    }

    /**
     * Getter for priceLists
     */
    get priceLists$(): Observable<PaginatedListResult<PriceList>> {
        return this._priceLists.asObservable();
    }

    /**
     * Getter for priceList
     */
    get priceList$(): Observable<PriceList> {
        return this._priceList.asObservable();
    }

    /**
     * Getter for priceLists loading
     */
    get priceListsLoading$(): Observable<boolean> {
        return this._priceListsLoading.asObservable();
    }

    /**
     * Getter for query parameters
     */
    get queryParameters$(): Observable<PriceListSearchParameters> {
        return this._queryParameters.asObservable();
    }

    /**
     * Get a priceList identified by the given priceList id
     */
    getById(id: string): Observable<PriceList> {
        return this.getSingle(id).pipe(
            map(priceList => {
                this._priceList.next(priceList);

                return priceList;
            }),
        );
    }

    /**
     * Create a dummy priceList
     */
    createEntity(): Observable<PriceList> {
        return this.priceLists$.pipe(
            take(1),
            switchMap(priceLists =>
                of({
                    id: emptyGuid,
                    code: '',
                    name: '',
                    serviceType: '',
                    durationType: '',
                    maxCount: 0,
                    price: 0,
                    priceExtra: 0,
                }).pipe(
                    map(newPriceList => {
                        // Update the priceLists with the new priceList
                        this._priceLists.next({ ...priceLists, items: [newPriceList, ...priceLists.items] });

                        // Return the new priceList
                        return newPriceList;
                    }),
                ),
            ),
        );
    }

    /**
     * Update priceList
     *
     * @param id
     * @param priceList
     */
    updateEntity(id: string, priceList: PriceList): Observable<PriceList> {
        return this.priceLists$.pipe(
            take(1),
            switchMap(priceLists =>
                this.create(priceList).pipe(
                    map(() => {
                        // Find the index of the updated priceList
                        const index = priceLists.items.findIndex(item => item.id === id);

                        // Update the priceList
                        priceLists[index] = priceList;

                        // Update the priceList
                        this._priceList.next(priceList);

                        // Return the updated priceList
                        return priceList;
                    }),
                    switchMap(updatedPriceList =>
                        this.priceList$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the priceList if it's selected
                                this._priceList.next(updatedPriceList);

                                // Return the updated priceList
                                return updatedPriceList;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Gets all priceLists
     * @returns
     */
    listEntities(params?: PriceListSearchParameters): Observable<PaginatedListResult<PriceList>> {
        this._priceListsLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10000);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        const queryString = httpParams.toString();

        const url = `?${queryString}`;

        return this.apiGet<PaginatedListResult<PriceList>>(url).pipe(
            map((list: PaginatedListResult<PriceList>) => {
                this._priceLists.next(list);

                this._queryParameters.next({
                    ...this._queryParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._priceListsLoading.next(false);
            }),
        );
    }

    /**
     * Delete the priceList identified by the given id
     * @param id
     * @returns
     */
    deleteEntity(id: string): Observable<PriceList> {
        return this._priceLists.pipe(
            take(1),
            switchMap(priceLists => {
                // Remove the priceList
                this._priceList.next(null);

                // Remove the priceList from the priceLists
                this._priceLists.next({ ...priceLists, items: priceLists.items.filter(item => item.id !== id) });

                // Return the priceList
                return this.delete(id);
            }),
            switchMap(priceList => {
                if (!priceList) {
                    return throwError('Could not found priceList with id of ' + id + '!');
                }

                return of(priceList);
            }),
        );
    }
}
