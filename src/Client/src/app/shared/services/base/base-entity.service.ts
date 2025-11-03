import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { BaseService } from './base.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { PaginatedList } from '../../types/shared.types';
import { APPLICATION_CONFIGURATION_TOKEN } from 'app/configurations/application-configuration.token';
import { ApplicationConfiguration } from 'app/configurations/application-configuration.types';

@Injectable({ providedIn: 'root' })
export class BaseEntityService<T> extends BaseService {
    constructor(
        protected http: HttpClient,
        @Inject(APPLICATION_CONFIGURATION_TOKEN) protected _applicationConfig: ApplicationConfiguration,
    ) {
        super(http, _applicationConfig);
    }

    private viewListSubject = new BehaviorSubject<boolean>(true);
    public viewList$ = this.viewListSubject.asObservable();

    setViewList(value: boolean): void {
        this.viewListSubject.next(value);
    }

    getViewList(): boolean {
        return this.viewListSubject.value;
    }

    toggleViewList(): void {
        this.viewListSubject.next(!this.viewListSubject.value);
    }

    getSingle(
        id: string,
        apiController?: string,
        httpHeaders?:
            | HttpHeaders
            | {
                  [header: string]: string | string[];
              },
    ): Observable<T> {
        return this.apiGet<T>(id, apiController, httpHeaders);
    }

    list(
        httpParams?: HttpParams,
        apiController?: string,
        httpHeaders?:
            | HttpHeaders
            | {
                  [header: string]: string | string[];
              },
    ): Observable<PaginatedList<T>> {
        let params = httpParams || new HttpParams();
        if (!params.has('pageIndex')) {
            params = params.set('pageIndex', 0);
        }
        if (!params.has('pageSize')) {
            params = params.set('pageSize', 1000);
        }
        const queryString = params?.toString();
        if (queryString) {
            return this.apiGet<PaginatedList<T>>(`?${queryString}`, apiController, httpHeaders);
        } else {
            return this.apiGet<PaginatedList<T>>('', apiController, httpHeaders);
        }
    }

    create<T>(
        data: any,
        apiController?: string,
        httpHeaders?:
            | HttpHeaders
            | {
                  [header: string]: string | string[];
              },
    ): Observable<T> {
        return this.apiPost<T>('', data, apiController, httpHeaders);
    }

    update(
        data: any,
        apiController?: string,
        httpHeaders?:
            | HttpHeaders
            | {
                  [header: string]: string | string[];
              },
    ): Observable<T> {
        return this.apiPut<T>('', data, apiController, httpHeaders);
    }

    delete(
        id: string,
        apiController?: string,
        httpHeaders?:
            | HttpHeaders
            | {
                  [header: string]: string | string[];
              },
    ): Observable<T> {
        return this.apiDelete<T>(id, apiController, httpHeaders);
    }

    saveBlob(blob: Blob, filename: string): void {
        const binaryData = [];
        binaryData.push(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: 'blob' }));
        downloadLink.setAttribute('download', filename);
        document.body.appendChild(downloadLink);
        downloadLink.click();
    }

    openBlob(response: HttpResponse<Blob>, applicationType: string, newTab = false): void {
        const binaryData = [];
        binaryData.push(response.body);
        const fileURL = window.URL.createObjectURL(new Blob(binaryData, { type: applicationType }));

        if (newTab) {
            window.open(fileURL, '_blank');
        } else {
            window.open(fileURL);
        }
    }
}
