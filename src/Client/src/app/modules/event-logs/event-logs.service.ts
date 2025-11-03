import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, finalize, map, Observable } from 'rxjs';
import { BaseService } from 'app/shared/services';
import { EventLog, EventLogSearchParameters } from 'app/shared/event-log';
import { PaginatedListResult } from 'app/shared/services/shared.types';
import { APPLICATION_CONFIGURATION_TOKEN } from 'app/configurations/application-configuration.token';
import { ApplicationConfiguration } from 'app/configurations/application-configuration.types';

@Injectable({ providedIn: 'root' })
export class EventLogsService extends BaseService {
    private _list: BehaviorSubject<PaginatedListResult<EventLog>> = new BehaviorSubject(null);
    private _loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _parameters: BehaviorSubject<EventLogSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });

    constructor(
        protected http: HttpClient,
        @Inject(APPLICATION_CONFIGURATION_TOKEN) protected _applicationConfig: ApplicationConfiguration,
    ) {
        super(http, _applicationConfig);
        this.defaultApiController = 'event-logs';
    }

    get list$(): Observable<PaginatedListResult<EventLog>> {
        return this._list.asObservable();
    }

    get loading$(): Observable<boolean> {
        return this._loading.asObservable();
    }

    get parameters$(): Observable<EventLogSearchParameters> {
        return this._parameters.asObservable();
    }

    // loadData(entityName: string, entityKey: string): Observable<EventLog[]> {
    //     const url = this.prepareUrl(`/${entityName}/${entityKey}`);
    //     return this.http.get<EventLog[]>(url);
    // }

    loadData$(parameters: EventLogSearchParameters): Observable<PaginatedListResult<EventLog>> {
        this._loading.next(true);

        let httpParams = new HttpParams();

        if (parameters?.pageIndex != null) {
            httpParams = httpParams.append('pageIndex', parameters.pageIndex);
        }

        if (parameters?.pageSize != null) {
            httpParams = httpParams.append('pageSize', parameters.pageSize);
        }

        if (parameters?.pattern) {
            httpParams = httpParams.append('pattern', parameters.pattern);
        }

        if (parameters?.entityName) {
            httpParams = httpParams.append('entityName', parameters.entityName);
        }

        if (parameters?.entityKey) {
            httpParams = httpParams.append('entityKey', parameters.entityKey);
        }

        const url = `/list?${httpParams.toString()}`;
        // return this.apiGet<PaginatedListResult<EventLog>>(url);

        return this.apiGet<PaginatedListResult<EventLog>>(url).pipe(
            map((data: PaginatedListResult<EventLog>) => {
                this._list.next(data);

                this._parameters.next({
                    ...this._parameters,
                    ...parameters,
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
}
