import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { BaseService } from './base/base.service';

@Injectable({
    providedIn: 'root',
})
export class UserSettingsService extends BaseService {
    constructor(protected http: HttpClient) {
        super(http);
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

    async getValue(key: string): Promise<string> {
        const url = this.prepareUrl(`?key=${key}`);
        return await lastValueFrom(this.http.get<string>(url));
    }

    setBooleanValue(key: string, value: boolean) {
        this.setValue(key, value ? 'true' : 'false');
    }

    async getBooleanValue(key: string): Promise<boolean> {
        const value = await this.getValue(key);
        return value === 'true';
    }
}
