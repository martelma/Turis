import { TranslocoModule } from '@ngneat/transloco';
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { AppSettings } from 'app/constants';
import { JournalEntrySidebarComponent } from './journal-entry-sidebar/journal-entry-sidebar.component';

@UntilDestroy()
@Component({
    selector: 'app-journal-entry',
    templateUrl: './journal-entry.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        JournalEntrySidebarComponent,
        RouterOutlet,
        TranslocoModule,
    ],
})
export class JournalEntryComponent implements OnInit, AfterViewInit {
    @ViewChild('drawer') drawer: MatDrawer;

    drawerFilterMode: 'over' | 'side' = 'side';
    drawerFilterOpened = false;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _userSettingsService: UserSettingsService,
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
        const toggleFilterValue = await this._userSettingsService.getValue(`${AppSettings.JournalEntry}:toggleFilter`);
        this.drawerFilterOpened = toggleFilterValue === '' ? false : toggleFilterValue === 'true';
    }

    createJournalEntry(): void {
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    async toggleFilter() {
        this.drawerFilterOpened = !this.drawerFilterOpened;

        const value = this.drawerFilterOpened ? 'true' : 'false';
        await this._userSettingsService.setValue(`${AppSettings.JournalEntry}:toggleFilter`, value);
    }
}
