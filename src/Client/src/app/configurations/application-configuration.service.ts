import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { ApplicationConfiguration } from './application-configuration.types';
import { CONFIGURATION_HTTP_CLIENT_TOKEN } from './configuration-http-client.provider';

@Injectable({ providedIn: 'root' })
export class ApplicationConfigurationService {
    private _configData: ApplicationConfiguration;

    constructor(@Inject(CONFIGURATION_HTTP_CLIENT_TOKEN) private configurationHttpClient: HttpClient) {
        // Usa la configurazione pre-caricata se disponibile
        const preloadedConfig = (window as any).__APP_CONFIG__;
        if (preloadedConfig) {
            this._configData = preloadedConfig;
            console.log('Using preloaded configuration');
        }
    }

    get configData(): ApplicationConfiguration {
        if (!this._configData) {
            throw new Error('Configuration not loaded. Make sure loadAppConfig() is called first.');
        }
        return this._configData;
    }

    loadAppConfig() {
        return this.configurationHttpClient.get('application-config.local.json').pipe(
            tap(data => {
                this._configData = data as ApplicationConfiguration;
            }),
            catchError(() => {
                return this.configurationHttpClient.get('application-config.json').pipe(
                    tap(data => {
                        this._configData = data as ApplicationConfiguration;
                    }),
                    catchError((error: HttpErrorResponse) => {
                        console.error('configuration not found!', error);
                        throw error;
                    }),
                );
            }),
        );
    }

    getConfig() {
        return this.configData;
    }
}
