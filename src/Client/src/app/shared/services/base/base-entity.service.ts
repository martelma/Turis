import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { PaginatedList } from '../../types/shared.types';

@Injectable({ providedIn: 'root' })
export class BaseEntityService<T> extends BaseService {
    constructor(protected http: HttpClient) {
        super(http);
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
        const queryString = httpParams?.toString();
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
