import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, filter, finalize, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { BaseEntityService } from 'app/shared/services';
import { Role, RoleSearchParameters } from './role.types';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';

@Injectable({ providedIn: 'root' })
export class RoleService extends BaseEntityService<Role> {
    private _roles: BehaviorSubject<PaginatedListResult<Role>> = new BehaviorSubject(null);
    private _role: BehaviorSubject<Role> = new BehaviorSubject(null);
    private _rolesLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _queryParameters: BehaviorSubject<RoleSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(http: HttpClient) {
        super(http);
        this.defaultApiController = 'role';
    }

    /**
     * Getter for roles
     */
    get roles$(): Observable<PaginatedListResult<Role>> {
        return this._roles.asObservable();
    }

    /**
     * Getter for role
     */
    get role$(): Observable<Role> {
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
    get queryParameters$(): Observable<RoleSearchParameters> {
        return this._queryParameters.asObservable();
    }

    /**
     * Get a role identified by the given role id
     */
    getById(id: string): Observable<Role> {
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
    createEntity(): Observable<Role> {
        return this.roles$.pipe(
            take(1),
            switchMap(roles =>
                of({
                    id: emptyGuid,
                    code: '',
                    name: '',
                    codeIso: '',
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
    updateEntity(id: string, role: Role): Observable<Role> {
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
    listEntities(params?: RoleSearchParameters): Observable<PaginatedListResult<Role>> {
        this._rolesLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        const queryString = httpParams.toString();

        const url = `?${queryString}`;

        return this.apiGet<PaginatedListResult<Role>>(url).pipe(
            map((list: PaginatedListResult<Role>) => {
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
    deleteEntity(id: string): Observable<Role> {
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
