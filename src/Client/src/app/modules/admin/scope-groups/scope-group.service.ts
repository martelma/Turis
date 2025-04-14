import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseEntityService } from 'app/shared/services';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';
import { BehaviorSubject, filter, finalize, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { ApplicationScopeGroup, ApplicationScopeGroupSearchParameters } from './scope-group.types';

@Injectable({ providedIn: 'root' })
export class ApplicationScopeGroupService extends BaseEntityService<ApplicationScopeGroup> {
    private _applicationScopeGroups: BehaviorSubject<PaginatedListResult<ApplicationScopeGroup>> = new BehaviorSubject(
        null,
    );
    private _applicationScopeGroup: BehaviorSubject<ApplicationScopeGroup> = new BehaviorSubject(null);
    private _applicationScopeGroupsLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _queryParameters: BehaviorSubject<ApplicationScopeGroupSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(http: HttpClient) {
        super(http);
        this.defaultApiController = 'scope-groups';
    }

    /**
     * Getter for applicationScopeGroups
     */
    get scopeGroups$(): Observable<PaginatedListResult<ApplicationScopeGroup>> {
        return this._applicationScopeGroups.asObservable();
    }

    /**
     * Getter for applicationScopeGroup
     */
    get scopeGroup$(): Observable<ApplicationScopeGroup> {
        return this._applicationScopeGroup.asObservable();
    }

    /**
     * Getter for applicationScopeGroups loading
     */
    get scopeGroupsLoading$(): Observable<boolean> {
        return this._applicationScopeGroupsLoading.asObservable();
    }

    /**
     * Getter for query parameters
     */
    get queryParameters$(): Observable<ApplicationScopeGroupSearchParameters> {
        return this._queryParameters.asObservable();
    }

    /**
     * Get a applicationScopeGroup identified by the given applicationScopeGroup id
     */
    getById(id: string): Observable<ApplicationScopeGroup> {
        return this.getSingle(id).pipe(
            map(applicationScopeGroup => {
                this._applicationScopeGroup.next(applicationScopeGroup);

                return applicationScopeGroup;
            }),
        );
    }

    /**
     * Create a dummy applicationScopeGroup
     */
    createEntity(): Observable<ApplicationScopeGroup> {
        return this.scopeGroups$.pipe(
            take(1),
            switchMap(applicationScopeGroups =>
                of({
                    id: emptyGuid,
                    name: '',
                    descrition: '',
                    applicationId: emptyGuid,
                    application: null,
                    scopes: [],
                }).pipe(
                    map(newApplicationScopeGroup => {
                        // Update the applicationScopeGroups with the new applicationScopeGroup
                        this._applicationScopeGroups.next({
                            ...applicationScopeGroups,
                            items: [newApplicationScopeGroup, ...applicationScopeGroups.items],
                        });

                        // Return the new applicationScopeGroup
                        return newApplicationScopeGroup;
                    }),
                ),
            ),
        );
    }

    /**
     * Update applicationScopeGroup
     *
     * @param id
     * @param applicationScopeGroup
     */
    updateEntity(id: string, applicationScopeGroup: ApplicationScopeGroup): Observable<ApplicationScopeGroup> {
        return this.scopeGroups$.pipe(
            take(1),
            switchMap(applicationScopeGroups =>
                this.create(applicationScopeGroup).pipe(
                    map(() => {
                        // Find the index of the updated applicationScopeGroup
                        const index = applicationScopeGroups.items.findIndex(item => item.id === id);

                        // Update the applicationScopeGroup
                        applicationScopeGroups[index] = applicationScopeGroup;

                        // Update the applicationScopeGroup
                        this._applicationScopeGroup.next(applicationScopeGroup);

                        // Return the updated applicationScopeGroup
                        return applicationScopeGroup;
                    }),
                    switchMap(updatedApplicationScopeGroup =>
                        this.scopeGroup$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the applicationScopeGroup if it's selected
                                this._applicationScopeGroup.next(updatedApplicationScopeGroup);

                                // Return the updated applicationScopeGroup
                                return updatedApplicationScopeGroup;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Gets all applicationScopeGroups
     * @returns
     */
    listEntities(
        params?: ApplicationScopeGroupSearchParameters,
    ): Observable<PaginatedListResult<ApplicationScopeGroup>> {
        this._applicationScopeGroupsLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        const queryString = httpParams.toString();

        const url = `?${queryString}`;

        return this.apiGet<PaginatedListResult<ApplicationScopeGroup>>(url).pipe(
            map((list: PaginatedListResult<ApplicationScopeGroup>) => {
                this._applicationScopeGroups.next(list);

                this._queryParameters.next({
                    ...this._queryParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._applicationScopeGroupsLoading.next(false);
            }),
        );
    }

    /**
     * Delete the applicationScopeGroup identified by the given id
     * @param id
     * @returns
     */
    deleteEntity(id: string): Observable<ApplicationScopeGroup> {
        return this._applicationScopeGroups.pipe(
            take(1),
            switchMap(applicationScopeGroups => {
                // Remove the applicationScopeGroup
                this._applicationScopeGroup.next(null);

                // Remove the applicationScopeGroup from the applicationScopeGroups
                this._applicationScopeGroups.next({
                    ...applicationScopeGroups,
                    items: applicationScopeGroups.items.filter(item => item.id !== id),
                });

                // Return the applicationScopeGroup
                return this.delete(id);
            }),
            switchMap(applicationScopeGroup => {
                if (!applicationScopeGroup) {
                    return throwError('Could not found applicationScopeGroup with id of ' + id + '!');
                }

                return of(applicationScopeGroup);
            }),
        );
    }
}
