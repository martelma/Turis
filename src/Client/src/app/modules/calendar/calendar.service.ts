import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, filter, finalize, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { BaseEntityService } from 'app/shared/services';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';
import { Service, ServiceSearchParameters } from '../service/service.types';

@Injectable({ providedIn: 'root' })
export class CalendarService extends BaseEntityService<Service> {
    private _services: BehaviorSubject<PaginatedListResult<Service>> = new BehaviorSubject(null);
    private _service: BehaviorSubject<Service> = new BehaviorSubject(null);
    private _servicesLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _queryParameters: BehaviorSubject<ServiceSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(http: HttpClient) {
        super(http);
        this.defaultApiController = 'service';
    }

    /**
     * Getter for services
     */
    get services$(): Observable<PaginatedListResult<Service>> {
        return this._services.asObservable();
    }

    /**
     * Getter for service
     */
    get service$(): Observable<Service> {
        return this._service.asObservable();
    }

    /**
     * Getter for services loading
     */
    get servicesLoading$(): Observable<boolean> {
        return this._servicesLoading.asObservable();
    }

    /**
     * Getter for query parameters
     */
    get serviceParameters$(): Observable<ServiceSearchParameters> {
        return this._queryParameters.asObservable();
    }

    /**
     * Get a service identified by the given service id
     */
    getById(id: string): Observable<Service> {
        return this.getSingle(id).pipe(
            map(service => {
                this._service.next(service);

                return service;
            }),
        );
    }

    /**
     * Create a dummy service
     */
    createEntity(): Observable<Service> {
        return this.services$.pipe(
            take(1),
            switchMap(services =>
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
                    map(newService => {
                        // Update the services with the new service
                        this._services.next({ ...services, items: [newService, ...services.items] });

                        // Return the new service
                        return newService;
                    }),
                ),
            ),
        );
    }

    /**
     * Update service
     *
     * @param id
     * @param service
     */
    updateEntity(id: string, service: Service): Observable<Service> {
        return this.services$.pipe(
            take(1),
            switchMap(services =>
                this.create(service).pipe(
                    map(() => {
                        // Find the index of the updated service
                        const index = services.items.findIndex(item => item.id === id);

                        // Update the service
                        services[index] = service;

                        // Update the service
                        this._service.next(service);

                        // Return the updated service
                        return service;
                    }),
                    switchMap(updatedService =>
                        this.service$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the service if it's selected
                                this._service.next(updatedService);

                                // Return the updated service
                                return updatedService;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Gets all services
     * @returns
     */
    listEntities(params?: ServiceSearchParameters): Observable<PaginatedListResult<Service>> {
        this._servicesLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        const queryString = httpParams.toString();

        const url = `?${queryString}`;

        return this.apiGet<PaginatedListResult<Service>>(url).pipe(
            map((list: PaginatedListResult<Service>) => {
                this._services.next(list);

                this._queryParameters.next({
                    ...this._queryParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._servicesLoading.next(false);
            }),
        );
    }

    /**
     * Delete the service identified by the given id
     * @param id
     * @returns
     */
    deleteEntity(id: string): Observable<Service> {
        return this._services.pipe(
            take(1),
            switchMap(services => {
                // Remove the service
                this._service.next(null);

                // Remove the service from the services
                this._services.next({ ...services, items: services.items.filter(item => item.id !== id) });

                // Return the service
                return this.delete(id);
            }),
            switchMap(service => {
                if (!service) {
                    return throwError('Could not found service with id of ' + id + '!');
                }

                return of(service);
            }),
        );
    }
}
