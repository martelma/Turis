import { PriceList } from 'app/modules/configuration/price-list/price-list.types';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, filter, finalize, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { BaseEntityService } from 'app/shared/services';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';
import { AccountStatementParameters, Service, ServiceSearchParameters } from './service.types';
import { ServiceSummary } from '../admin/dashboard/dashboard.types';

@Injectable({ providedIn: 'root' })
export class ServiceService extends BaseEntityService<Service> {
    selectedServiceChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    private _serviceEdited: BehaviorSubject<string> = new BehaviorSubject(null);
    private _serviceCopied: BehaviorSubject<string> = new BehaviorSubject(null);

    private _serviceSummary: BehaviorSubject<ServiceSummary> = new BehaviorSubject(null);
    private _services: BehaviorSubject<PaginatedListResult<Service>> = new BehaviorSubject(null);
    private _service: BehaviorSubject<Service> = new BehaviorSubject(null);
    private _servicesLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _serviceParameters: BehaviorSubject<ServiceSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(http: HttpClient) {
        super(http);
        this.defaultApiController = 'service';
    }

    get serviceSummary$(): Observable<ServiceSummary> {
        return this._serviceSummary.asObservable();
    }

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
     * Getter for service parameters
     */
    get serviceParameters$(): Observable<ServiceSearchParameters> {
        return this._serviceParameters.asObservable();
    }

    /**
     * Getter for service edited
     */
    get serviceEdited$(): Observable<string> {
        return this._serviceEdited.asObservable();
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
        const service: Service = {
            id: undefined,
            code: '',
            title: '',
            date: undefined,
            dateText: undefined,
            start: undefined,
            end: undefined,
            serviceType: undefined,
            durationType: undefined,
            referent: '',
            referentPhone: '',
            note: '',
            // language: null,
            languages: [],
            userId: undefined,
            creationDate: undefined,
            status: undefined,
            workflowCollaboratorStatus: undefined,
            optionExpiration: undefined,
            optionExpirationText: undefined,
            location: '',
            meetingPlace: '',
            people: 0,
            checked: false,
            priceListId: undefined,
            priceList: new PriceList(),
            priceCalculated: 0,
            price: 0,
            clientId: undefined,
            client: undefined,
            collaboratorId: undefined,
            collaborator: undefined,
            cIGCode: undefined,
            cUPCode: undefined,
            cashedIn: false,
            cashedDate: undefined,

            commissionPercentage: 0,
            commissionCalculated: 0,
            commission: 0,
            commissionNote: '',
            commissionPaid: false,
            commissionPaymentDate: undefined,

            bookmarkId: undefined,
            attachmentsCount: 0,

            billingStatus: undefined,
            commissionStatus: undefined,
            tags: [],

            selected: false,
        };

        this._service.next(service);

        return of(service);
    }

    /**
     * Update service
     *
     * @param id
     * @param service
     */
    saveEntity(id: string, service: Service): Observable<Service> {
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
        httpParams = httpParams.append('onlyBookmarks', params?.onlyBookmarks ? 'true' : 'false');
        httpParams = httpParams.append('code', params?.code ?? '');
        httpParams = httpParams.append('title', params?.title ?? '');
        httpParams = httpParams.append('note', params?.note ?? '');
        httpParams = httpParams.append('serviceType', params?.serviceType ?? '');
        httpParams = httpParams.append('durationType', params?.durationType ?? '');
        httpParams = httpParams.append('dateFrom', params?.dateFrom ?? '');
        httpParams = httpParams.append('dateTo', params?.dateTo ?? '');

        const serviceString = httpParams.toString();

        const url = `?${serviceString}`;

        return this.apiGet<PaginatedListResult<Service>>(url).pipe(
            map((data: PaginatedListResult<Service>) => {
                this._services.next(data);

                this._serviceParameters.next({
                    ...this._serviceParameters,
                    ...params,
                    pageIndex: data.pageIndex,
                    pageSize: data.pageSize,
                });

                return data;
            }),
            finalize(() => {
                this._servicesLoading.next(false);
            }),
        );
    }

    listAccountStatement(params?: AccountStatementParameters): Observable<PaginatedListResult<Service>> {
        this._servicesLoading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('contactid', params?.contactId);
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        httpParams = httpParams.append('serviceType', params?.serviceType ?? '');
        httpParams = httpParams.append('durationType', params?.durationType ?? '');
        httpParams = httpParams.append('dateFrom', params?.dateFrom ?? '');
        httpParams = httpParams.append('dateTo', params?.dateTo ?? '');

        const serviceString = httpParams.toString();

        const url = `account-statement?${serviceString}`;

        return this.apiGet<PaginatedListResult<Service>>(url).pipe(
            map((data: PaginatedListResult<Service>) => {
                this._services.next(data);

                this._serviceParameters.next({
                    ...this._serviceParameters,
                    ...params,
                    pageIndex: data.pageIndex,
                    pageSize: data.pageSize,
                });

                return data;
            }),
            finalize(() => {
                this._servicesLoading.next(false);
            }),
        );
    }

    summary(): Observable<ServiceSummary> {
        this._servicesLoading.next(true);

        const url = `summary`;

        return this.apiGet<ServiceSummary>(url).pipe(
            map((data: ServiceSummary) => {
                this._serviceSummary.next(data);

                return data;
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

    downloadData(serviceId: string): Observable<void> {
        return this.http.post<void>(this.prepareUrl('download-data'), {
            id: serviceId,
        });
    }

    publish(serviceId: string): Observable<void> {
        return this.http.post<void>(this.prepareUrl(`${serviceId}/publish`), null);
    }

    copyService(serviceId: string): void {
        this._serviceCopied.next(serviceId);
    }

    editService(serviceId: string): void {
        this._serviceEdited.next(serviceId);
    }

    setCheck(service: Service): void {
        return;
    }

    setUnCheck(service: Service): void {
        return;
    }
}
