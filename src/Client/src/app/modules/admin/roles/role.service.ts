import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BaseEntityService } from 'app/shared/services';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';
import { BehaviorSubject, filter, finalize, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { ApplicationRole, ApplicationRoleSearchParameters } from './role.types';
import { APPLICATION_CONFIGURATION_TOKEN } from 'app/configurations/application-configuration.token';
import { ApplicationConfiguration } from 'app/configurations/application-configuration.types';

@Injectable({ providedIn: 'root' })
export class ApplicationRoleService extends BaseEntityService<ApplicationRole> {
    private _roles: BehaviorSubject<PaginatedListResult<ApplicationRole>> = new BehaviorSubject(null);
    private _role: BehaviorSubject<ApplicationRole> = new BehaviorSubject(null);
    private _rolesLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _queryParameters: BehaviorSubject<ApplicationRoleSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(
        protected http: HttpClient,
        @Inject(APPLICATION_CONFIGURATION_TOKEN) protected _applicationConfig: ApplicationConfiguration,
    ) {
        super(http, _applicationConfig);
        this.defaultApiController = 'roles';
    }

    /**
     * Getter for roles
     */
    get roles$(): Observable<PaginatedListResult<ApplicationRole>> {
        return this._roles.asObservable();
    }

    /**
     * Getter for role
     */
    get role$(): Observable<ApplicationRole> {
        return this._role.asObservable();
    }

    /**
     * Getter for roles loading
     */
    get rolesLoading$(): Observable<boolean> {
        return this._rolesLoading.asObservable();
    }

    /**
     * Getter for query parameters
     */
    get queryParameters$(): Observable<ApplicationRoleSearchParameters> {
        return this._queryParameters.asObservable();
    }

    /**
     * Get a role identified by the given role id
     */
    getById(id: string): Observable<ApplicationRole> {
        return this.getSingle(id).pipe(
            map(role => {
                this._role.next(role);

                return role;
            }),
        );
    }

    /**
     * Create a dummy role
     */
    createEntity(): Observable<ApplicationRole> {
        return this.roles$.pipe(
            take(1),
            switchMap(roles =>
                of({
                    id: emptyGuid,
                    applicationId: emptyGuid,
                    name: '',
                    description: '',
                    scopes: [],
                    users: [],
                }).pipe(
                    map(newRole => {
                        // Update the roles with the new role
                        this._roles.next({ ...roles, items: [newRole, ...roles.items] });

                        // Return the new role
                        return newRole;
                    }),
                ),
            ),
        );
    }

    /**
     * Update role
     *
     * @param id
     * @param role
     */
    updateEntity(id: string, role: ApplicationRole): Observable<ApplicationRole> {
        return this.roles$.pipe(
            take(1),
            switchMap(roles =>
                this.create(role).pipe(
                    map(() => {
                        // Find the index of the updated role
                        const index = roles.items.findIndex(item => item.id === id);

                        // Update the role
                        roles[index] = role;

                        // Update the role
                        this._role.next(role);

                        // Return the updated role
                        return role;
                    }),
                    switchMap(updatedRole =>
                        this.role$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the role if it's selected
                                this._role.next(updatedRole);

                                // Return the updated role
                                return updatedRole;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Gets all roles
     * @returns
     */
    listEntities(params?: ApplicationRoleSearchParameters): Observable<PaginatedListResult<ApplicationRole>> {
        this._rolesLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        const queryString = httpParams.toString();

        const url = `?${queryString}`;

        return this.apiGet<PaginatedListResult<ApplicationRole>>(url).pipe(
            map((list: PaginatedListResult<ApplicationRole>) => {
                this._roles.next(list);

                this._queryParameters.next({
                    ...this._queryParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._rolesLoading.next(false);
            }),
        );
    }

    /**
     * Delete the role identified by the given id
     * @param id
     * @returns
     */
    deleteEntity(id: string): Observable<ApplicationRole> {
        return this._roles.pipe(
            take(1),
            switchMap(roles => {
                // Remove the role
                this._role.next(null);

                // Remove the role from the roles
                this._roles.next({ ...roles, items: roles.items.filter(item => item.id !== id) });

                // Return the role
                return this.delete(id);
            }),
            switchMap(role => {
                if (!role) {
                    return throwError('Could not found role with id of ' + id + '!');
                }

                return of(role);
            }),
        );
    }
}
