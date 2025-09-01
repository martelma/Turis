import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base/base.service';
import { EventLog } from '../event-log';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class EventLogService extends BaseService {
    constructor(protected http: HttpClient) {
        super(http);
        this.defaultApiController = 'event-logs';
    }

    loadData(entityName: string, entityKey: string): Observable<EventLog[]> {
        const url = this.prepareUrl(`/${entityName}/${entityKey}`);
        return this.http.get<EventLog[]>(url);
    }
}
