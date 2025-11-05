import { TranslocoModule } from '@jsverse/transloco';
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ServiceSidebarComponent } from './service-sidebar/service-sidebar.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { AppSettings } from 'app/constants';
import { TagSummaryComponent } from 'app/shared/components/tag-summary/tag-summary.component';
import { ServiceService } from './service.service';
import { ServiceSearchParameters } from './service.types';

@UntilDestroy()
@Component({
    selector: 'app-service',
    templateUrl: './service.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        ServiceSidebarComponent,
        RouterOutlet,
        TranslocoModule,
        TagSummaryComponent,
    ],
})
export class ServiceComponent implements OnInit, AfterViewInit {
    @ViewChild('drawer') drawer: MatDrawer;

    serviceSearchParameters: ServiceSearchParameters;

    drawerFilterMode: 'over' | 'side' = 'side';
    drawerFilterOpened = false;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _userSettingsService: UserSettingsService,
        private _serviceService: ServiceService,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }
    }

    async ngOnInit(): Promise<void> {
        // Query parameters
        this._serviceService.parameters$
            .pipe(untilDestroyed(this))
            .subscribe((queryParameters: ServiceSearchParameters) => {
                this.serviceSearchParameters = queryParameters;
            });
    }

    async ngAfterViewInit(): Promise<void> {
        this.drawerFilterOpened = await this._userSettingsService.getBooleanValue(
            `${AppSettings.Service}:toggleFilter`,
            false,
        );
    }

    createService(): void {
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    async toggleFilter() {
        this.drawerFilterOpened = !this.drawerFilterOpened;

        const value = this.drawerFilterOpened ? 'true' : 'false';
        await this._userSettingsService.setValue(`${AppSettings.Service}:toggleFilter`, value);
    }

    async changeView(): Promise<void> {
        this._serviceService.toggleViewList();
        await this._userSettingsService.setBooleanValue(
            `${AppSettings.Service}:viewList`,
            this._serviceService.getViewList(),
        );
    }

    serviceFilter(parameters: ServiceSearchParameters) {
        this.serviceSearchParameters.pattern = parameters.pattern;
        // this.serviceSearchParameters.onlyBookmarks = parameters.onlyBookmarks;
        this.serviceSearchParameters.code = parameters.code;
        this.serviceSearchParameters.title = parameters.title;
        this.serviceSearchParameters.note = parameters.note;
        this.serviceSearchParameters.serviceType = parameters.serviceType;
        this.serviceSearchParameters.durationType = parameters.durationType;
        this.serviceSearchParameters.languages = parameters.languages;

        if (parameters.dateFrom) {
            this.serviceSearchParameters.dateFrom = parameters.dateFrom;
        }
        if (parameters.dateTo) {
            this.serviceSearchParameters.dateTo = parameters.dateTo;
        }
    }
}
