import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { BaseService } from './base/base.service';
import { APPLICATION_CONFIGURATION_TOKEN } from 'app/configurations/application-configuration.token';
import { ApplicationConfiguration } from 'app/configurations/application-configuration.types';

@Injectable({
    providedIn: 'root',
})
export class UserSettingsService extends BaseService {
    constructor(
        protected http: HttpClient,
        @Inject(APPLICATION_CONFIGURATION_TOKEN) protected _applicationConfig: ApplicationConfiguration,
    ) {
        super(http, _applicationConfig);
        this.defaultApiController = 'user-settings';
    }

    setValue(key: string, value: string) {
        const url = this.prepareUrl('');
        const model = { key: key, value: value };
        this.http
            .post<string>(url, model)
            .subscribe({
                next: (data: any) => {
                    return '';
                },
                error: error => {},
            })
            .add(() => {});
    }

    async getStringValue(key: string, defaultValue?: string): Promise<string> {
        try {
            const url = this.prepareUrl(`?key=${key}`);
            const value = await lastValueFrom(this.http.get<string>(url));

            // Se il valore è null, undefined o stringa vuota, ritorna il defaultValue
            if (value == null || value === '') {
                return defaultValue || '';
            }

            return value;
        } catch (error) {
            // In caso di errore (es. chiave non trovata), ritorna il defaultValue
            return defaultValue || '';
        }
    }

    setNumberValue(key: string, value: number) {
        this.setValue(key, value.toString());
    }

    async getNumberValue(key: string, defaultValue?: number): Promise<number> {
        const value = await this.getStringValue(key);
        const parsedValue = parseInt(value);

        // Se il parsing fallisce (NaN), ritorna il defaultValue
        if (isNaN(parsedValue)) {
            return defaultValue || 0;
        }

        return parsedValue;
    }

    setBooleanValue(key: string, value: boolean) {
        this.setValue(key, value ? 'true' : 'false');
    }

    async getBooleanValue(key: string, defaultValue?: boolean): Promise<boolean> {
        const value = await this.getStringValue(key);
        if (value === 'true') {
            return true;
        } else if (value === 'false') {
            return false;
        }
        return defaultValue || false;
    }
}
