import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { BaseEntityService } from 'app/shared/services';
import { Application, ApplicationRole, ApplicationScope, ApplicationScopeGroup } from './applications.types';
import { XApplicationIdHeader } from '../admin.types';
import { BaseSearchParameters, PaginatedList } from '../../../shared/types/shared.types';

@Injectable({
    providedIn: 'root',
})
export class ApplicationsService extends BaseEntityService<Application> {
    private _applications: BehaviorSubject<PaginatedList<Application>> = new BehaviorSubject({
        items: [],
        pageIndex: 0,
        pageSize: 10,
        totalCount: 0,
        hasNextPage: false,
    });
    private _application: BehaviorSubject<Application> = new BehaviorSubject(null);

    private _applicationRoles: BehaviorSubject<PaginatedList<ApplicationRole>> = new BehaviorSubject<
        PaginatedList<ApplicationRole>
    >({
        items: [],
        pageIndex: 0,
        pageSize: 10,
        totalCount: 0,
        hasNextPage: false,
    });
    private _applicationRole: BehaviorSubject<ApplicationRole> = new BehaviorSubject<ApplicationRole>(null);

    private _applicationScopes: BehaviorSubject<PaginatedList<ApplicationScope>> = new BehaviorSubject<
        PaginatedList<ApplicationScope>
    >({
        items: [],
        pageIndex: 0,
        pageSize: 10,
        totalCount: 0,
        hasNextPage: false,
    });
    private _applicationScope: BehaviorSubject<ApplicationScope> = new BehaviorSubject<ApplicationScope>(null);

    private _applicationScopeGroups: BehaviorSubject<PaginatedList<ApplicationScopeGroup>> = new BehaviorSubject<
        PaginatedList<ApplicationScopeGroup>
    >({
        items: [],
        pageIndex: 0,
        pageSize: 10,
        totalCount: 0,
        hasNextPage: false,
    });
    private _applicationScopeGroup: BehaviorSubject<ApplicationScopeGroup> = new BehaviorSubject<ApplicationScopeGroup>(
        null,
    );

    constructor(protected httpClient: HttpClient) {
        super(httpClient);
        this.defaultApiController = 'applications';
    }

    /**
     * Getter for applications
     */
    get applications$(): Observable<PaginatedList<Application>> {
        return this._applications.asObservable();
    }

    get applications(): PaginatedList<Application> {
        return this._applications.getValue();
    }

    /**
     * Getter for application
     */
    get application$(): Observable<Application> {
        return this._application.asObservable();
    }

    /**
     * Getter for application roles
     */
    get applicationRoles$(): Observable<PaginatedList<ApplicationRole>> {
        return this._applicationRoles.asObservable();
    }

    get applicationRoles(): PaginatedList<ApplicationRole> {
        return this._applicationRoles.getValue();
    }

    /**
     * Getter for application role
     */
    get applicationRole$(): Observable<ApplicationRole> {
        return this._applicationRole.asObservable();
    }

    /**
     * Getter for application scopes
     */
    get applicationScopes$(): Observable<PaginatedList<ApplicationScope>> {
        return this._applicationScopes.asObservable();
    }

    get applicationScopes(): PaginatedList<ApplicationScope> {
        return this._applicationScopes.getValue();
    }

    /**
     * Getter for application scope
     */
    get applicationScope$(): Observable<ApplicationScope> {
        return this._applicationScope.asObservable();
    }

    /**
     * Getter for application scope groups
     */
    get applicationScopeGroups$(): Observable<PaginatedList<ApplicationScope>> {
        return this._applicationScopeGroups.asObservable();
    }

    get applicationScopeGroups(): PaginatedList<ApplicationScope> {
        return this._applicationScopeGroups.getValue();
    }

    /**
     * Getter for application scope group
     */
    get applicationScopeGroup$(): Observable<ApplicationScopeGroup> {
        return this._applicationScopeGroup.asObservable();
    }

    /**
     * Gets the list of available applications
     */
    getApplications(params?: BaseSearchParameters): Observable<PaginatedList<Application>> {
        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');

        return this.list(httpParams, null, XApplicationIdHeader).pipe(
            map((list: PaginatedList<Application>) => {
                this._applications.next(list);

                return list;
            }),
        );
    }

    /**
     * Creates/modifies an application
     * @param application the application to be created/modified
     * @param isCreate indicates whether the application is being created or not
     * @returns the created/modified application
     */
    saveApplication(application: Application, isCreate: boolean): Observable<Application> {
        return this.create(application, null, XApplicationIdHeader).pipe(
            map((application: Application) => {
                this._application.next(application);

                if (isCreate) {
                    this._applications.next({
                        ...this.applications,
                        items: [...this.applications.items, application],
                    });
                } else {
                    this._applications.next({
                        ...this.applications,
                        items: this.applications.items.map(app => (app.id === application.id ? application : app)),
                    });
                }

                return application;
            }),
        );
    }

    /**
     * Delete the application identified by the given id
     * @param id the id of the application to be deleted
     * @returns the deleted application
     */
    deleteApplication(id: string): Observable<Application> {
        return this.delete(id, null, XApplicationIdHeader).pipe(
            map((application: Application) => {
                // Remove the application
                this._application.next(application);

                this._applications.next({
                    ...this.applications,
                    items: this.applications.items.filter(item => item.id !== id),
                });

                // Return the application
                return application;
            }),
        );
    }

    /**
     * Get application by id
     */
    getApplicationById(id: string): Observable<Application> {
        if (!id) {
            this._application.next(null);
            return of(null);
        }

        if (id === 'new') {
            const app = {
                name: '',
                description: '',
                icon: '',
                url: '',
            };

            this._application.next(app);
            return of(app);
        }

        return this.getSingle(id, null, XApplicationIdHeader).pipe(
            map((user: Application) => {
                this._application.next(user);
                return user;
            }),
        );
    }

    /**
     * Gets the roles associated to a given application
     * @param applicationId the id of the application whose roles are to be retrieved
     * @returns the roles associated to a given application
     */
    getApplicationRoles(applicationId: string): Observable<PaginatedList<ApplicationRole>> {
        return this.apiGet(`${applicationId}/roles`, null, XApplicationIdHeader).pipe(
            map((list: PaginatedList<ApplicationRole>) => {
                this._applicationRoles.next(list);

                return list;
            }),
        );
    }

    /**
     * Gets the role identified by the given id for the given application
     * @param applicationId the id of the application whose role is to be retrieved
     * @param roleId the id of the role to be retrieved
     * @returns the application role
     */
    getApplicationRoleById(applicationId: string, roleId: string): Observable<ApplicationRole> {
        if (!roleId) {
            this._applicationRole.next(null);
            return of(null);
        }

        if (roleId === 'new') {
            const role = {
                id: null,
                name: '',
                scopes: [],
            };

            this._applicationRole.next(role);
            return of(role);
        }

        return this.apiGet(`${applicationId}/roles/${roleId}`, null, XApplicationIdHeader).pipe(
            map((role: ApplicationRole) => {
                this._applicationRole.next(role);

                return role;
            }),
        );
    }

    /**
     * Creates/modifies a role within an application
     * @param applicationId the application whose role is to be created/modified
     * @param role the role to be created/modified
     * @param isCreate indicates whether the role is being created or not
     * @returns the created/modified role
     */
    saveApplicationRole(applicationId: string, role: ApplicationRole, isCreate: boolean): Observable<ApplicationRole> {
        return this.apiPost(`${applicationId}/roles`, role, null, XApplicationIdHeader).pipe(
            map((role: ApplicationRole) => {
                this._applicationRole.next(role);

                if (isCreate) {
                    this._applicationRoles.next({
                        ...this.applicationRoles,
                        items: [...this.applicationRoles.items, role],
                    });
                } else {
                    this._applicationRoles.next({
                        ...this.applicationRoles,
                        items: this.applicationRoles.items.map(appRole => (appRole.id === role.id ? role : appRole)),
                    });
                }

                return role;
            }),
        );
    }

    /**
     * Delete the role within an application identified by the given id
     * @param applicationId the id of the application whose role is to be deleted
     * @param roleId the id of the role to be deleted
     * @returns the deleted role
     */
    deleteApplicationRole(applicationId: string, roleId: string): Observable<ApplicationRole> {
        return this.apiDelete(`${applicationId}/roles/${roleId}`, null, XApplicationIdHeader).pipe(
            map((role: ApplicationRole) => {
                this._applicationRole.next(role);

                this._applicationRoles.next({
                    ...this.applicationRoles,
                    items: this.applicationRoles.items.filter(item => item.id !== roleId),
                });

                return role;
            }),
        );
    }

    /**
     * Gets the scopes associated to a given application
     * @param applicationId the id of the application whose scopes are to be retrieved
     * @returns the scopes associated to a given application
     */
    getApplicationScopes(applicationId: string): Observable<PaginatedList<ApplicationScope>> {
        return this.apiGet(`${applicationId}/scopes`, null, XApplicationIdHeader).pipe(
            map((list: PaginatedList<ApplicationScope>) => {
                this._applicationScopes.next(list);

                return list;
            }),
        );
    }

    /**
     * Gets the scope identified by the given id for the given application
     * @param applicationId the id of the application whose scope is to be retrieved
     * @param scopeId the id of the scope to be retrieved
     * @returns the application scope
     */
    getApplicationScopeById(applicationId: string, scopeId: string): Observable<ApplicationScope> {
        if (!scopeId) {
            this._applicationScope.next(null);
            return of(null);
        }

        if (scopeId === 'new') {
            const scope = {
                name: '',
            };

            this._applicationScope.next(scope);
            return of(scope);
        }

        return this.apiGet(`${applicationId}/scopes/${scopeId}`, null, XApplicationIdHeader).pipe(
            map((scope: ApplicationScope) => {
                this._applicationScope.next(scope);

                return scope;
            }),
        );
    }

    /**
     * Creates/modifies a scope within an application
     * @param applicationId the application whose scope is to be created/modified
     * @param scope the scope to be created/modified
     * @param isCreate indicates whether the scope is being created or not
     * @returns the created/modified scope
     */
    saveApplicationScope(
        applicationId: string,
        scope: ApplicationScope,
        isCreate: boolean,
    ): Observable<ApplicationScope> {
        return this.apiPost(`${applicationId}/scopes`, scope, null, XApplicationIdHeader).pipe(
            map((scope: ApplicationScope) => {
                this._applicationScope.next(scope);

                if (isCreate) {
                    this._applicationScopes.next({
                        ...this.applicationScopes,
                        items: [...this.applicationScopes.items, scope],
                    });
                } else {
                    this._applicationScopes.next({
                        ...this.applicationScopes,
                        items: this.applicationScopes.items.map(appScope =>
                            appScope.id === scope.id ? scope : appScope,
                        ),
                    });
                }

                return scope;
            }),
        );
    }

    /**
     * Delete the scope within an application identified by the given id
     * @param applicationId the id of the application whose scope is to be deleted
     * @param roleId the id of the scope to be deleted
     * @returns the deleted scope
     */
    deleteApplicationScope(applicationId: string, scopeId: string): Observable<ApplicationScope> {
        return this.apiDelete(`${applicationId}/scopes/${scopeId}`, null, XApplicationIdHeader).pipe(
            map((role: ApplicationScope) => {
                this._applicationScope.next(role);

                this._applicationScopes.next({
                    ...this.applicationScopes,
                    items: this.applicationScopes.items.filter(item => item.id !== scopeId),
                });

                return role;
            }),
        );
    }

    /**
     * Gets the scope groups associated to a given application
     * @param applicationId the id of the application whose scope groups are to be retrieved
     * @returns the scope groups associated to a given application
     */
    getApplicationScopeGroups(
        applicationId: string,
        includeScopes = false,
    ): Observable<PaginatedList<ApplicationScopeGroup>> {
        return this.apiGet(
            `${applicationId}/scopeGroups?includeScopes=${includeScopes}`,
            null,
            XApplicationIdHeader,
        ).pipe(
            map((list: PaginatedList<ApplicationScopeGroup>) => {
                this._applicationScopeGroups.next(list);

                return list;
            }),
        );
    }

    /**
     * Gets the scope group identified by the given id for the given application
     * @param applicationId the id of the application whose scope group is to be retrieved
     * @param scopeGroupId the id of the scope group to be retrieved
     * @returns the application scope group
     */
    getApplicationScopeGroupById(
        applicationId: string,
        scopeGroupId: string,
        includeScopes = false,
    ): Observable<ApplicationScopeGroup> {
        if (!scopeGroupId) {
            this._applicationScopeGroup.next(null);
            return of(null);
        }

        if (scopeGroupId === 'new') {
            const scopeGroup = {
                name: '',
            };

            this._applicationScopeGroup.next(scopeGroup);
            return of(scopeGroup);
        }

        return this.apiGet(
            `${applicationId}/scopeGroups/${scopeGroupId}?includeScopes=${includeScopes}`,
            null,
            XApplicationIdHeader,
        ).pipe(
            map((scopeGroup: ApplicationScopeGroup) => {
                this._applicationScopeGroup.next(scopeGroup);

                return scopeGroup;
            }),
        );
    }

    /**
     * Creates/modifies a scope group within an application
     * @param applicationId the application whose scope group is to be created/modified
     * @param scopeGroup the scope group to be created/modified
     * @param isCreate indicates whether the scope group is being created or not
     * @returns the created/modified scope group
     */
    saveApplicationScopeGroup(
        applicationId: string,
        scopeGroup: ApplicationScopeGroup,
        isCreate: boolean,
    ): Observable<ApplicationScopeGroup> {
        return this.apiPost(`${applicationId}/scopeGroups`, scopeGroup, null, XApplicationIdHeader).pipe(
            map((scopeGroup: ApplicationScopeGroup) => {
                this._applicationScopeGroup.next(scopeGroup);

                if (isCreate) {
                    this._applicationScopeGroups.next({
                        ...this.applicationScopeGroups,
                        items: [...this.applicationScopeGroups.items, scopeGroup],
                    });
                } else {
                    this._applicationScopeGroups.next({
                        ...this.applicationScopeGroups,
                        items: this.applicationScopeGroups.items.map(appScopeGroup =>
                            appScopeGroup.id === scopeGroup.id ? scopeGroup : appScopeGroup,
                        ),
                    });
                }

                return scopeGroup;
            }),
        );
    }

    /**
     * Delete the scope group within an application identified by the given id
     * @param applicationId the id of the application whose scope group is to be deleted
     * @param scopeGroupId the id of the scope group to be deleted
     * @returns the deleted scope group
     */
    deleteApplicationScopeGroup(applicationId: string, scopeGroupId: string): Observable<ApplicationScopeGroup> {
        return this.apiDelete(`${applicationId}/scopeGroups/${scopeGroupId}`).pipe(
            map((scopeGroup: ApplicationScopeGroup) => {
                this._applicationScopeGroup.next(scopeGroup);

                this._applicationScopeGroups.next({
                    ...this.applicationScopeGroups,
                    items: this.applicationScopeGroups.items.filter(item => item.id !== scopeGroupId),
                });

                return scopeGroup;
            }),
        );
    }
}
