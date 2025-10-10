import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from 'app/core/auth/auth.service';
import { MaterialModule } from 'app/modules/material.module';
import { User } from 'app/core/user/user.types';
import { Otp } from 'app/core/auth/auth.types';
import { Observable } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceSummaryComponent } from './service-summary/service-summary.component';
import { TeamSummaryComponent } from './team-summary/team-summary.component';
import { JournalEntrySummaryComponent } from './journal-entry-summary/journal-entry-summary.component';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { Service } from 'app/modules/service/service.types';
import { ServiceService } from 'app/modules/service/service.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatBadgeModule } from '@angular/material/badge';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { AppSettings } from 'app/constants';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@UntilDestroy()
@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        MatButtonModule,
        MatBadgeModule,
        MatCheckboxModule,
        FuseDrawerComponent,
        TranslocoModule,
        ServiceSummaryComponent,
        TeamSummaryComponent,
        JournalEntrySummaryComponent,
    ],
})
export class DashboardComponent implements OnInit, AfterViewInit {
    public user: User;
    public isScreenSmall: boolean;

    selectedTabIndex = 0;

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened = false;

    serviceSummaryType: string;
    services: Service[] = [];

    years: number[] = [];
    currentYear: number;

    viewMode = 'total';

    searchFilter: string;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _userSettingsService: UserSettingsService,
        private _authService: AuthService,
        private _userService: UserService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _serviceService: ServiceService,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }
    }

    ngOnInit(): void {
        this.viewMode = 'total';
        this._loadUser();

        const currentYear = new Date().getFullYear();
        this.years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    }

    async ngAfterViewInit(): Promise<void> {
        this.currentYear = await this._userSettingsService.getNumberValue(
            `${AppSettings.HomePage}:team-summary-current-year`,
        );

        setTimeout(async () => {
            this.viewMode = await this._userSettingsService.getValue(`${AppSettings.HomePage}:team-summary-view-mode`);
        }, 0);

        this.selectedTabIndex = await this._userSettingsService.getNumberValue(
            `${AppSettings.HomePage}:selectedTabIndex`,
        );

        this._changeDetectorRef.detectChanges();
    }

    onTabChanged(index: number): void {
        this.selectedTabIndex = index;
        this._userSettingsService.setNumberValue(`${AppSettings.HomePage}:selectedTabIndex`, index);
    }

    private _loadUser(): void {
        this._userService
            .me()
            .pipe(untilDestroyed(this))
            .subscribe((user: User) => {
                this.user = user;
            });
    }

    private _getSiteOtp(): Observable<Otp> {
        return this._authService.generateOtp();
    }

    serviceSummaryDetails(event: any): void {
        this.drawerOpened = !this.drawerOpened;
        if (!this.drawerOpened) {
            return;
        }

        this.serviceSummaryType = event;
        this.loadServiceSummaryDetails();
    }

    closeDrawer(): void {
        this.drawerOpened = false;
        this._changeDetectorRef.detectChanges();
    }

    async drawerDetailsChanged(opened: boolean): Promise<void> {
        if (!opened) {
            this.drawerOpened = false;
            this.services = [];
            this._changeDetectorRef.detectChanges();
        }
    }

    loadServiceSummaryDetails(): void {
        this.services = [];

        this._serviceService
            .summaryDetails(this.serviceSummaryType)
            .pipe(untilDestroyed(this))
            .subscribe(items => {
                this.services = items;
                console.log('loadServiceSummaryDetails', items);
            });
    }

    checkAll() {
        if (this.services) {
            this.services.forEach(service => {
                service.selected = true;
            });
        }
    }

    uncheckAll() {
        if (this.services) {
            this.services.forEach(service => {
                service.selected = false;
            });
        }
    }

    onYearChange(event: MatButtonToggleChange): void {
        this.currentYear = event.value;
        this._userSettingsService.setNumberValue(`${AppSettings.HomePage}:team-summary-current-year`, this.currentYear);
    }

    onViewModeChange(event: MatButtonToggleChange): void {
        this.viewMode = event.value;
        this._userSettingsService.setValue(`${AppSettings.HomePage}:team-summary-view-mode`, this.viewMode);
    }

    onSortChange(event: any): void {
        console.log('onSortChange', event.value);
    }

    onInputChange(event: any): void {
        console.log('onInputChange', event.value);
        this.searchFilter = event;
        console.log('onInputChange', this.searchFilter);
    }
}
