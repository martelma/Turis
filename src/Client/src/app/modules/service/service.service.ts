import { PriceList } from 'app/modules/configuration/price-list/price-list.types';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, filter, finalize, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { BaseEntityService } from 'app/shared/services';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { AccountStatementParameters, CalendarInfo, Service, ServiceSearchParameters } from './service.types';
import { ContactSummary, ServiceSummary } from '../admin/dashboard/dashboard.types';
import { LinkedService } from './linkedService';

@Injectable({ providedIn: 'root' })
export class ServiceService extends BaseEntityService<Service> {
    private _edited: BehaviorSubject<string> = new BehaviorSubject(null);
    private _serviceCopied: BehaviorSubject<string> = new BehaviorSubject(null);

    private _serviceSummary: BehaviorSubject<ServiceSummary> = new BehaviorSubject(null);
    private _contactSummary: BehaviorSubject<ContactSummary> = new BehaviorSubject(null);

    private _list: BehaviorSubject<PaginatedListResult<Service>> = new BehaviorSubject(null);
    private _listSummary: BehaviorSubject<CalendarInfo[]> = new BehaviorSubject(null);
    private _item: BehaviorSubject<Service> = new BehaviorSubject(null);
    private _loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _parameters: BehaviorSubject<ServiceSearchParameters> = new BehaviorSubject({
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

    get contactSummary$(): Observable<ContactSummary> {
        return this._contactSummary.asObservable();
    }

    get list$(): Observable<PaginatedListResult<Service>> {
        return this._list.asObservable();
    }

    get item$(): Observable<Service> {
        return this._item.asObservable();
    }

    get loading$(): Observable<boolean> {
        return this._loading.asObservable();
    }

    get parameters$(): Observable<ServiceSearchParameters> {
        return this._parameters.asObservable();
    }

    get edited$(): Observable<string> {
        return this._edited.asObservable();
    }

    getById(id: string): Observable<Service> {
        return this.getSingle(id).pipe(
            map(service => {
                this._item.next(service);

                return service;
            }),
        );
    }

    createEntity(): Observable<Service> {
        const item: Service = {
            id: undefined,
            code: '',
            title: '',
            date: undefined,
            dateText: undefined,
            timeText: undefined,
            start: undefined,
            end: undefined,
            serviceType: undefined,
            durationType: undefined,
            referent: '',
            referentPhone: '',
            note: '',
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
            count: undefined,
        };

        this._item.next(item);

        return of(item);
    }

    saveEntity(id: string, service: Service): Observable<Service> {
        return this.list$.pipe(
            take(1),
            switchMap(services =>
                this.create(service).pipe(
                    map(() => {
                        // Find the index of the updated service
                        const index = services.items.findIndex(item => item.id === id);

                        // Update the service
                        services[index] = service;

                        // Update the service
                        this._item.next(service);

                        // Return the updated service
                        return service;
                    }),
                    switchMap(updatedService =>
                        this.item$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the service if it's selected
                                this._item.next(updatedService);

                                // Return the updated service
                                return updatedService;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    listSummary(collaboratorId: string, dateFrom: Date, dateTo: Date): Observable<CalendarInfo[]> {
        if (!collaboratorId) {
            return of([]);
        }

        this._loading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('collaboratorId', collaboratorId);
        httpParams = httpParams.append('dateFrom', dateFrom ? this.toUtcString(dateFrom) : '');
        httpParams = httpParams.append('dateTo', dateTo ? this.toUtcString(dateTo) : '');

        const serviceString = httpParams.toString();

        const url = `list-summary?${serviceString}`;
        console.log('listSummary url', url);

        return this.apiGet<CalendarInfo[]>(url).pipe(
            map((data: CalendarInfo[]) => {
                this._listSummary.next(data);

                return data;
            }),
            finalize(() => {
                this._loading.next(false);
            }),
        );
    }

    private toUtcString(date: Date): string {
        if (date === null || date === undefined) {
            return '';
        }

        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('');
    }

    listEntities(params?: ServiceSearchParameters): Observable<PaginatedListResult<Service>> {
        this._loading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        httpParams = httpParams.append('onlyBookmarks', params?.onlyBookmarks ? 'true' : 'false');
        httpParams = httpParams.append('code', params?.code ?? '');
        httpParams = httpParams.append('title', params?.title ?? '');
        httpParams = httpParams.append('location', params?.location ?? '');
        httpParams = httpParams.append('note', params?.note ?? '');
        httpParams = httpParams.append('serviceType', params?.serviceType ?? '');
        httpParams = httpParams.append('durationType', params?.durationType ?? '');
        httpParams = httpParams.append('status', params?.status ?? '');
        httpParams = httpParams.append('dateFrom', params?.dateFrom ?? '');
        httpParams = httpParams.append('dateTo', params?.dateTo ?? '');
        httpParams = httpParams.append('collaboratorId', params?.collaboratorId ?? '');
        params?.languages?.forEach(x => {
            httpParams = httpParams.append('languages', x);
        });

        const serviceString = httpParams.toString();

        const url = `?${serviceString}`;

        return this.apiGet<PaginatedListResult<Service>>(url).pipe(
            map((data: PaginatedListResult<Service>) => {
                this._list.next(data);

                this._parameters.next({
                    ...this._parameters,
                    ...params,
                    pageIndex: data.pageIndex,
                    pageSize: data.pageSize,
                });

                return data;
            }),
            finalize(() => {
                this._loading.next(false);
            }),
        );
    }

    filterEntities(params?: ServiceSearchParameters): Observable<PaginatedListResult<Service>> {
        this._loading.next(true);

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
        httpParams = httpParams.append('status', params?.status ?? '');
        httpParams = httpParams.append('dateFrom', params?.dateFrom ?? '');
        httpParams = httpParams.append('dateTo', params?.dateTo ?? '');
        params?.languages?.forEach(x => {
            httpParams = httpParams.append('languages', x);
        });

        const serviceString = httpParams.toString();

        const url = `?${serviceString}`;

        return this.apiGet<PaginatedListResult<Service>>(url).pipe(
            map((data: PaginatedListResult<Service>) => {
                this._parameters.next({
                    ...this._parameters,
                    ...params,
                    pageIndex: data.pageIndex,
                    pageSize: data.pageSize,
                });

                return data;
            }),
            finalize(() => {
                this._loading.next(false);
            }),
        );
    }

    listAccountStatement(params?: AccountStatementParameters): Observable<PaginatedListResult<Service>> {
        this._loading.next(true);

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
                this._list.next(data);

                this._parameters.next({
                    ...this._parameters,
                    ...params,
                    pageIndex: data.pageIndex,
                    pageSize: data.pageSize,
                });

                return data;
            }),
            finalize(() => {
                this._loading.next(false);
            }),
        );
    }

    listServicesToBeBilled(year: number, clientId: string): Observable<Service[]> {
        const url = `to-be-billed/${year}/${clientId}`;
        return this.apiGet<Service[]>(url);
    }

    listServicesToBePaid(year: number, collaboratorId: string): Observable<Service[]> {
        const url = `to-be-paid/${year}/${collaboratorId}`;
        return this.apiGet<Service[]>(url);
    }

    summary(year: number): Observable<ServiceSummary> {
        this._loading.next(true);

        const url = `summary/${year}`;

        return this.apiGet<ServiceSummary>(url).pipe(
            map((data: ServiceSummary) => {
                this._serviceSummary.next(data);

                return data;
            }),
            finalize(() => {
                this._loading.next(false);
            }),
        );
    }

    summaryDetails(type: string): Observable<Service[]> {
        this._loading.next(true);

        let url = '';

        if (type === 'proposals') {
            url = `summary-details-proposals`;
        }

        if (type === 'checked') {
            url = `summary-details-checked`;
        }

        if (type === 'todo') {
            url = `summary-details-todo`;
        }

        if (type === 'done') {
            url = `summary-details-done`;
        }

        return this.apiGet<Service[]>(url).pipe(
            map((data: Service[]) => {
                return data;
            }),
            finalize(() => {
                this._loading.next(false);
            }),
        );
    }

    listContactSummary(contactId: string, year: number): Observable<ContactSummary> {
        this._loading.next(true);

        const url = `contact-summary/${contactId}/${year}`;

        return this.apiGet<ContactSummary>(url).pipe(
            map((data: ContactSummary) => {
                this._contactSummary.next(data);

                return data;
            }),
            finalize(() => {
                this._loading.next(false);
            }),
        );
    }

    deleteEntity(id: string): Observable<Service> {
        return this._list.pipe(
            take(1),
            switchMap(services => {
                // Remove the service
                this._item.next(null);

                // Remove the service from the services
                this._list.next({ ...services, items: services.items.filter(item => item.id !== id) });

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

    downloadData(id: string): Observable<void> {
        return this.http.post<void>(this.prepareUrl('download-data'), {
            id: id,
        });
    }

    publish(id: string): Observable<void> {
        return this.http.post<void>(this.prepareUrl(`${id}/publish`), null);
    }

    copyEntity(id: string): void {
        this._serviceCopied.next(id);
    }

    editEntity(id: string): void {
        this._edited.next(id);
    }

    setCheck(service: Service): void {
        return;
    }

    setUnCheck(service: Service): void {
        return;
    }

    notifyProposal(serviceId: string) {
        return this.apiPost(`notify-proposal/${serviceId}`, { serviceId: serviceId });
    }

    checkDataInfo(serviceId: string) {
        return this.apiGet(`check-data-info/${serviceId}`);
    }

    acceptService(serviceId: string) {
        return this.apiPost(`accept-service/${serviceId}`);
    }

    rejectService(serviceId: string) {
        return this.apiPost(`reject-service/${serviceId}`);
    }

    linkedServices(serviceId: string): Observable<LinkedService> {
        return this.apiGet<LinkedService>(`linked-services/${serviceId}`);
    }

    addSourceService(sourceId: string, targetId: string): Observable<void> {
        return this.apiPost<void>(`${sourceId}/add-source-service/${targetId}`);
    }

    removeSourceService(sourceId: string, targetId: string): Observable<void> {
        return this.apiPost<void>(`${sourceId}/remove-source-service/${targetId}`);
    }

    addTargetService(sourceId: string, targetId: string): Observable<void> {
        return this.apiPost<void>(`${targetId}/add-target-service/${sourceId}`);
    }

    removeTargetService(sourceId: string, targetId: string): Observable<void> {
        return this.apiPost<void>(`${targetId}/remove-target-service/${sourceId}`);
    }
}
