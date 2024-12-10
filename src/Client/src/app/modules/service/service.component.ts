import { TranslocoModule } from '@ngneat/transloco';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ServiceSidebarComponent } from './service-sidebar/service-sidebar.component';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServiceListComponent } from './service-list/service-list.component';

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
    ],
})
export class ServiceComponent {
    @ViewChild('drawer') drawer: MatDrawer;

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened = false;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }
    }

    createService(): void {
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }
}
