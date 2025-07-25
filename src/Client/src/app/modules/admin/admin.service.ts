import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from 'app/shared/services';
import { Observable } from 'rxjs';
import { KeyValue } from './console/console.types';

@Injectable({ providedIn: 'root' })
export class AdminService extends BaseService {
    constructor(http: HttpClient) {
        super(http);

        this.defaultApiController = 'admin';
    }

    backendConfiguration(): Observable<KeyValue[]> {
        return this.apiGet<KeyValue[]>('backend-configuration');
    }

    truncateElmah(): Observable<string> {
        return this.apiPost<string>('truncate-elmah', null);
    }

    mailProposal(): Observable<string> {
        return this.apiPost<string>('mail-proposal', null);
    }
}
