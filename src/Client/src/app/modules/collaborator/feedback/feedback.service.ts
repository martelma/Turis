import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { BaseService } from 'app/shared/services';
import { Service } from 'app/modules/service/service.types';
import { ServiceService } from 'app/modules/service/service.service';

@Injectable({ providedIn: 'root' })
export class FeedbackService extends BaseService {
    private _service: BehaviorSubject<Service> = new BehaviorSubject(null);
    private _servicesLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        http: HttpClient,
        private serviceService: ServiceService,
    ) {
        super(http);
    }

    get service$(): Observable<Service> {
        return this._service.asObservable();
    }

    get servicesLoading$(): Observable<boolean> {
        return this._servicesLoading.asObservable();
    }

    getService(id: string): Observable<Service> {
        return this.serviceService.getSingle(id).pipe(
            map(service => {
                this._service.next(service);

                return service;
            }),
        );
    }

    checkDataInfo(serviceId: string) {
        return this.serviceService.checkDataInfo(serviceId);
    }

    acceptService(serviceId: string) {
        return this.serviceService.acceptService(serviceId);
    }

    rejectService(serviceId: string) {
        return this.serviceService.rejectService(serviceId);
    }
}
