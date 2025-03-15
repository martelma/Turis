import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MaterialModule } from 'app/modules/material.module';
import { User } from 'app/core/user/user.types';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceSummary } from '../dashboard.types';
import { ServiceService } from 'app/modules/service/service.service';

@UntilDestroy()
@Component({
    selector: 'app-service-summary',
    standalone: true,
    templateUrl: './service-summary.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [CommonModule, FormsModule, MaterialModule, TranslocoModule],
})
export class ServiceSummaryComponent implements OnInit {
    public user: User;
    public isScreenSmall: boolean;

    serviceSummary: ServiceSummary;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _serviceService: ServiceService,
        private _router: Router,
    ) {}

    ngOnInit(): void {
        this._serviceService.serviceSummary$.pipe(untilDestroyed(this)).subscribe((data: ServiceSummary) => {
            this.serviceSummary = data;
        });

        this.loadData();
    }

    loadData(): void {
        this._serviceService
            .summary()
            .pipe(untilDestroyed(this))
            .subscribe(items => {
                this.serviceSummary = items;
            });
    }
}
