import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
}
