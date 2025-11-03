import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { VersionInfo } from './application-version-info.types';
import { VERSION_INFO_HTTP_CLIENT_TOKEN } from './version-info-http-client.provider';

@Injectable({ providedIn: 'root' })
export class ApplicationVersionInfoService {
    private _versionInfoData: VersionInfo;

    constructor(@Inject(VERSION_INFO_HTTP_CLIENT_TOKEN) private versionInfoHttpClient: HttpClient) {}

    get versionInfoData(): VersionInfo {
        if (!this._versionInfoData) {
            throw new Error('Configuration not loaded. Make sure loadAppConfig() is called first.');
        }
        return this._versionInfoData;
    }

    loadAppVersion() {
        return this.versionInfoHttpClient.get('version-info.json').pipe(
            tap(data => {
                this._versionInfoData = data as VersionInfo;
            }),
            catchError((error: HttpErrorResponse) => {
                console.log('🚀 [VersionInfoService] - loadAppConfig - Configuration not found!', error);
                throw error;
            }),
        );
    }

    getConfig() {
        return this.versionInfoData;
    }
}
