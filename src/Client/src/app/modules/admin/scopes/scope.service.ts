import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, filter, finalize, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { BaseEntityService } from 'app/shared/services';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';
import { ApplicationScopesSearchParameters, Scope } from '../roles/scopes.types';

@Injectable({ providedIn: 'root' })
export class ScopeService extends BaseEntityService<Scope> {
    private _scopes: BehaviorSubject<PaginatedListResult<Scope>> = new BehaviorSubject(null);
    private _scope: BehaviorSubject<Scope> = new BehaviorSubject(null);
    private _scopesLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _queryParameters: BehaviorSubject<ApplicationScopesSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(http: HttpClient) {
        super(http);
        this.defaultApiController = 'scope';
    }

    /**
     * Getter for scopes
     */
    get scopes$(): Observable<PaginatedListResult<Scope>> {
        return this._scopes.asObservable();
    }

    /**
     * Getter for scope
     */
    get scope$(): Observable<Scope> {
        return this._scope.asObservable();
    }

    /**
     * Getter for scopes loading
     */
    get scopesLoading$(): Observable<boolean> {
        return this._scopesLoading.asObservable();
    }

    /**
     * Getter for query parameters
     */
    get queryParameters$(): Observable<ApplicationScopesSearchParameters> {
        return this._queryParameters.asObservable();
    }

    /**
     * Get a scope identified by the given scope id
     */
    getById(id: string): Observable<Scope> {
        return this.getSingle(id).pipe(
            map(scope => {
                this._scope.next(scope);

                return scope;
            }),
        );
    }

    /**
     * Create a dummy scope
     */
    createEntity(): Observable<Scope> {
        return this.scopes$.pipe(
            take(1),
            switchMap(scopes =>
                of({
                    id: emptyGuid,
                    code: '',
                    name: '',
                    codeIso: '',
                }).pipe(
                    map(newScope => {
                        // Update the scopes with the new scope
                        this._scopes.next({ ...scopes, items: [newScope, ...scopes.items] });

                        // Return the new scope
                        return newScope;
                    }),
                ),
            ),
        );
    }

    /**
     * Update scope
     *
     * @param id
     * @param scope
     */
    updateEntity(id: string, scope: Scope): Observable<Scope> {
        return this.scopes$.pipe(
            take(1),
            switchMap(scopes =>
                this.create(scope).pipe(
                    map(() => {
                        // Find the index of the updated scope
                        const index = scopes.items.findIndex(item => item.id === id);

                        // Update the scope
                        scopes[index] = scope;

                        // Update the scope
                        this._scope.next(scope);

                        // Return the updated scope
                        return scope;
                    }),
                    switchMap(updatedScope =>
                        this.scope$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the scope if it's selected
                                this._scope.next(updatedScope);

                                // Return the updated scope
                                return updatedScope;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Gets all scopes
     * @returns
     */
    listEntities(params?: ApplicationScopesSearchParameters): Observable<PaginatedListResult<Scope>> {
        this._scopesLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        const queryString = httpParams.toString();

        const url = `?${queryString}`;

        return this.apiGet<PaginatedListResult<Scope>>(url).pipe(
            map((list: PaginatedListResult<Scope>) => {
                this._scopes.next(list);

                this._queryParameters.next({
                    ...this._queryParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._scopesLoading.next(false);
            }),
        );
    }

    /**
     * Delete the scope identified by the given id
     * @param id
     * @returns
     */
    deleteEntity(id: string): Observable<Scope> {
        return this._scopes.pipe(
            take(1),
            switchMap(scopes => {
                // Remove the scope
                this._scope.next(null);

                // Remove the scope from the scopes
                this._scopes.next({ ...scopes, items: scopes.items.filter(item => item.id !== id) });

                // Return the scope
                return this.delete(id);
            }),
            switchMap(scope => {
                if (!scope) {
                    return throwError('Could not found scope with id of ' + id + '!');
                }

                return of(scope);
            }),
        );
    }
}
