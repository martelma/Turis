import { TranslocoModule } from '@jsverse/transloco';
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { AppSettings } from 'app/constants';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { PaymentService } from './payment.service';
import { PaymentSidebarComponent } from './payment-sidebar/payment-sidebar.component';

@UntilDestroy()
@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgIf,
        NgTemplateOutlet,
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        PaymentSidebarComponent,
        RouterOutlet,
        TranslocoModule,
    ],
})
export class PaymentComponent implements OnInit, AfterViewInit {
    @ViewChild('drawer') drawer: MatDrawer;

    drawerFilterMode: 'over' | 'side' = 'side';
    drawerFilterOpened = false;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _userSettingsService: UserSettingsService,
        private _paymentService: PaymentService,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }
    }

    async ngOnInit(): Promise<void> {}

    async ngAfterViewInit(): Promise<void> {
        this.drawerFilterOpened = await this._userSettingsService.getBooleanValue(
            `${AppSettings.Payment}:toggleFilter`,
            false,
        );
    }

    createPayment(): void {
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    async toggleFilter() {
        this.drawerFilterOpened = !this.drawerFilterOpened;

        const value = this.drawerFilterOpened ? 'true' : 'false';
        await this._userSettingsService.setValue(`${AppSettings.Payment}:toggleFilter`, value);
    }

    async changeView(): Promise<void> {
        this._paymentService.toggleViewList();
        await this._userSettingsService.setBooleanValue(
            `${AppSettings.Payment}:viewList`,
            this._paymentService.getViewList(),
        );
    }
}
