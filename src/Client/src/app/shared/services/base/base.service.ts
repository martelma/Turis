import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApplicationConfiguration } from 'app/configurations/application-configuration.types';
import { replace } from 'lodash';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BaseService {
    protected defaultApiController = '';
    protected defaultBaseUrl: string;

    constructor(
        protected http: HttpClient,
        protected _applicationConfig: ApplicationConfiguration,
    ) {
        this.defaultBaseUrl = this._applicationConfig.baseUrl;
    }

    prepareUrl(relativeUrl?: string, apiController?: string): string {
        let url: string;

        if (!apiController) url = `${this.defaultApiController}/${relativeUrl}`;
        else url = `${apiController}/${relativeUrl}`;

        url = replace(url, '//', '/');
        url = `${this.defaultBaseUrl}/api/${url}`;
        return url;
    }

    apiGet<T>(
        relativeUrl?: string,
        apiController?: string,
        httpHeaders?:
            | HttpHeaders
            | {
                  [header: string]: string | string[];
              },
        httpParams?: HttpParams,
    ): Observable<T> {
        const url = this.prepareUrl(relativeUrl, apiController);
        return this.http.get<T>(url, { headers: httpHeaders, params: httpParams });
    }

    apiPost<T>(
        relativeUrl?: string,
        data?: T,
        apiController?: string,
        httpHeaders?:
            | HttpHeaders
            | {
                  [header: string]: string | string[];
              },
        httpParams?: HttpParams,
    ): Observable<T> {
        return this.http.post<T>(this.prepareUrl(relativeUrl, apiController), data, {
            headers: httpHeaders,
            params: httpParams,
        });
    }

    apiPut<T>(
        relativeUrl?: string,
        data?: T,
        apiController?: string,
        httpHeaders?:
            | HttpHeaders
            | {
                  [header: string]: string | string[];
              },
        httpParams?: HttpParams,
    ): Observable<T> {
        return this.http.put<T>(this.prepareUrl(relativeUrl, apiController), data, {
            headers: httpHeaders,
            params: httpParams,
        });
    }

    apiDelete<T>(
        relativeUrl?: string,
        apiController?: string,
        httpHeaders?:
            | HttpHeaders
            | {
                  [header: string]: string | string[];
              },
        httpParams?: HttpParams,
    ): Observable<T> {
        return this.http.delete<T>(this.prepareUrl(relativeUrl, apiController), {
            headers: httpHeaders,
            params: httpParams,
        });
    }

    /**
     * Setter & getter for security Code
     */
    set securityCode(token: string) {
        localStorage.setItem('securityCode', token);
    }

    get securityCode(): string {
        return localStorage.getItem('securityCode') ?? '';
    }
}
