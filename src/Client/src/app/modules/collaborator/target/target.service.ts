import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, filter, finalize, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { BaseEntityService } from 'app/shared/services';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';
import { Target, TargetSearchParameters } from './target.types';
import { APPLICATION_CONFIGURATION_TOKEN } from 'app/configurations/application-configuration.token';
import { ApplicationConfiguration } from 'app/configurations/application-configuration.types';

@Injectable({ providedIn: 'root' })
export class TargetService extends BaseEntityService<Target> {
    private _targets: BehaviorSubject<PaginatedListResult<Target>> = new BehaviorSubject(null);
    private _target: BehaviorSubject<Target> = new BehaviorSubject(null);
    private _targetsLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _queryParameters: BehaviorSubject<TargetSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(
        protected http: HttpClient,
        @Inject(APPLICATION_CONFIGURATION_TOKEN) protected _applicationConfig: ApplicationConfiguration,
    ) {
        super(http, _applicationConfig);
        this.defaultApiController = 'target';
    }

    /**
     * Getter for targets
     */
    get targets$(): Observable<PaginatedListResult<Target>> {
        return this._targets.asObservable();
    }

    /**
     * Getter for target
     */
    get target$(): Observable<Target> {
        return this._target.asObservable();
    }

    /**
     * Getter for targets loading
     */
    get targetsLoading$(): Observable<boolean> {
        return this._targetsLoading.asObservable();
    }

    /**
     * Getter for query parameters
     */
    get queryParameters$(): Observable<TargetSearchParameters> {
        return this._queryParameters.asObservable();
    }

    /**
     * Get a target identified by the given target id
     */
    getById(id: string): Observable<Target> {
        return this.getSingle(id).pipe(
            map(target => {
                this._target.next(target);

                return target;
            }),
        );
    }

    /**
     * Create a dummy target
     */
    createEntity(): Observable<Target> {
        return this.targets$.pipe(
            take(1),
            switchMap(targets => {
                return of({
                    id: emptyGuid,
                    collaboratorId: '',
                    collaborator: null,
                    year: 0,
                    month: 0,
                    amountMin: 0,
                    amountMax: 0,
                    percentageMin: 0,
                    percentageMax: 0,
                    edit: true,
                    new: true,
                }).pipe(
                    map(newTarget => {
                        // Update the targets with the new target
                        this._targets.next({ ...targets, items: [newTarget, ...targets.items] });

                        // Return the new target
                        return newTarget;
                    }),
                );
            }),
        );
    }

    /**
     * Update target
     *
     * @param id
     * @param target
     */
    updateEntity(id: string, target: Target): Observable<Target> {
        return this.targets$.pipe(
            take(1),
            switchMap(targets =>
                this.create(target).pipe(
                    map(() => {
                        // Find the index of the updated target
                        const index = targets.items.findIndex(item => item.id === id);

                        // Update the target
                        targets[index] = target;

                        // Update the target
                        this._target.next(target);

                        // Return the updated target
                        return target;
                    }),
                    switchMap(updatedTarget =>
                        this.target$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the target if it's selected
                                this._target.next(updatedTarget);

                                // Return the updated target
                                return updatedTarget;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Gets all targets
     * @returns
     */
    listEntities(params?: TargetSearchParameters): Observable<PaginatedListResult<Target>> {
        this._targetsLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');

        httpParams = httpParams.append('collaboratorId', params?.collaboratorId ?? '');
        httpParams = httpParams.append('year', params?.year > 0 ? params.year.toString() : '0');
        httpParams = httpParams.append('month', params?.month > 0 ? params.month.toString() : '0');

        const queryString = httpParams.toString();

        const url = `?${queryString}`;

        return this.apiGet<PaginatedListResult<Target>>(url).pipe(
            map((list: PaginatedListResult<Target>) => {
                this._targets.next(list);

                this._queryParameters.next({
                    ...this._queryParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._targetsLoading.next(false);
            }),
        );
    }

    /**
     * Gets all targets
     * @returns
     */
    commissionStats(params?: TargetSearchParameters): Observable<PaginatedListResult<Target>> {
        this._targetsLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');

        httpParams = httpParams.append('collaboratorId', params?.collaboratorId ?? '');
        httpParams = httpParams.append('year', params?.year > 0 ? params.year.toString() : '0');
        httpParams = httpParams.append('month', params?.month > 0 ? params.month.toString() : '0');

        const queryString = httpParams.toString();

        const url = `commission-stats?${queryString}`;

        return this.apiGet<PaginatedListResult<Target>>(url).pipe(
            map((list: PaginatedListResult<Target>) => {
                this._targets.next(list);

                this._queryParameters.next({
                    ...this._queryParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._targetsLoading.next(false);
            }),
        );
    }

    /**
     * Delete the target identified by the given id
     * @param id
     * @returns
     */
    deleteEntity(id: string): Observable<Target> {
        return this._targets.pipe(
            take(1),
            switchMap(targets => {
                // Remove the target
                this._target.next(null);

                // Remove the target from the targets
                this._targets.next({ ...targets, items: targets.items.filter(item => item.id !== id) });

                // Return the target
                return this.delete(id);
            }),
            switchMap(target => {
                if (!target) {
                    return throwError('Could not found target with id of ' + id + '!');
                }

                return of(target);
            }),
        );
    }
}
