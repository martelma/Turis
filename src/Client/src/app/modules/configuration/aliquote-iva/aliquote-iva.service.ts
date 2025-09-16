import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, filter, finalize, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { BaseEntityService } from 'app/shared/services';
import { AliquotaIva, AliquotaIvaSearchParameters } from './aliquota-iva.types';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';

@Injectable({ providedIn: 'root' })
export class AliquotaIvaService extends BaseEntityService<AliquotaIva> {
    private _aliquotaIvas: BehaviorSubject<PaginatedListResult<AliquotaIva>> = new BehaviorSubject(null);
    private _aliquotaIva: BehaviorSubject<AliquotaIva> = new BehaviorSubject(null);
    private _aliquotaIvasLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _queryParameters: BehaviorSubject<AliquotaIvaSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(http: HttpClient) {
        super(http);
        this.defaultApiController = 'aliquotaIva';
    }

    /**
     * Getter for aliquotaIvas
     */
    get aliquotaIvas$(): Observable<PaginatedListResult<AliquotaIva>> {
        return this._aliquotaIvas.asObservable();
    }

    /**
     * Getter for aliquotaIva
     */
    get aliquotaIva$(): Observable<AliquotaIva> {
        return this._aliquotaIva.asObservable();
    }

    /**
     * Getter for aliquotaIvas loading
     */
    get aliquotaIvasLoading$(): Observable<boolean> {
        return this._aliquotaIvasLoading.asObservable();
    }

    /**
     * Getter for query parameters
     */
    get queryParameters$(): Observable<AliquotaIvaSearchParameters> {
        return this._queryParameters.asObservable();
    }

    /**
     * Get a aliquotaIva identified by the given aliquotaIva id
     */
    getById(id: string): Observable<AliquotaIva> {
        return this.getSingle(id).pipe(
            map(aliquotaIva => {
                this._aliquotaIva.next(aliquotaIva);

                return aliquotaIva;
            }),
        );
    }

    /**
     * Create a dummy aliquotaIva
     */
    createEntity(): Observable<AliquotaIva> {
        return this.aliquotaIvas$.pipe(
            take(1),
            switchMap(aliquotaIvas =>
                of({
                    id: emptyGuid,
                    code: '',
                    name: '',
                    description: '',
                    aliquota: 0,
                    codiceNatura: '',
                }).pipe(
                    map(newAliquotaIva => {
                        // Update the aliquotaIvas with the new aliquotaIva
                        this._aliquotaIvas.next({ ...aliquotaIvas, items: [newAliquotaIva, ...aliquotaIvas.items] });

                        // Return the new aliquotaIva
                        return newAliquotaIva;
                    }),
                ),
            ),
        );
    }

    /**
     * Update aliquotaIva
     *
     * @param id
     * @param aliquotaIva
     */
    updateEntity(id: string, aliquotaIva: AliquotaIva): Observable<AliquotaIva> {
        return this.aliquotaIvas$.pipe(
            take(1),
            switchMap(aliquotaIvas =>
                this.create(aliquotaIva).pipe(
                    map(() => {
                        // Find the index of the updated aliquotaIva
                        const index = aliquotaIvas.items.findIndex(item => item.id === id);

                        // Update the aliquotaIva
                        aliquotaIvas[index] = aliquotaIva;

                        // Update the aliquotaIva
                        this._aliquotaIva.next(aliquotaIva);

                        // Return the updated aliquotaIva
                        return aliquotaIva;
                    }),
                    switchMap(updatedAliquotaIva =>
                        this.aliquotaIva$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the aliquotaIva if it's selected
                                this._aliquotaIva.next(updatedAliquotaIva);

                                // Return the updated aliquotaIva
                                return updatedAliquotaIva;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Gets all aliquotaIvas
     * @returns
     */
    listEntities(params?: AliquotaIvaSearchParameters): Observable<PaginatedListResult<AliquotaIva>> {
        this._aliquotaIvasLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        const queryString = httpParams.toString();

        const url = `?${queryString}`;

        return this.apiGet<PaginatedListResult<AliquotaIva>>(url).pipe(
            map((list: PaginatedListResult<AliquotaIva>) => {
                this._aliquotaIvas.next(list);

                this._queryParameters.next({
                    ...this._queryParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._aliquotaIvasLoading.next(false);
            }),
        );
    }

    /**
     * Delete the aliquotaIva identified by the given id
     * @param id
     * @returns
     */
    deleteEntity(id: string): Observable<AliquotaIva> {
        return this._aliquotaIvas.pipe(
            take(1),
            switchMap(aliquotaIvas => {
                // Remove the aliquotaIva
                this._aliquotaIva.next(null);

                // Remove the aliquotaIva from the aliquotaIvas
                this._aliquotaIvas.next({ ...aliquotaIvas, items: aliquotaIvas.items.filter(item => item.id !== id) });

                // Return the aliquotaIva
                return this.delete(id);
            }),
            switchMap(aliquotaIva => {
                if (!aliquotaIva) {
                    return throwError('Could not found aliquotaIva with id of ' + id + '!');
                }

                return of(aliquotaIva);
            }),
        );
    }
}
