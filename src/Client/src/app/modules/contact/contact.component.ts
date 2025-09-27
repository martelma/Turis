import { TranslocoModule } from '@ngneat/transloco';
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContactSidebarComponent } from './contact-sidebar/contact-sidebar.component';
import { ContactListComponent } from './contact-list/contact-list.component';
import { UserSettingsService } from 'app/shared/services/user-setting.service';
import { AppSettings } from 'app/constants';
import { ContactService } from './contact.service';

@UntilDestroy()
@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        ContactSidebarComponent,
        RouterOutlet,
        TranslocoModule,
        ContactListComponent,
    ],
})
export class ContactComponent implements OnInit, AfterViewInit {
    @ViewChild('drawer') drawer: MatDrawer;

    drawerFilterMode: 'over' | 'side' = 'side';
    drawerFilterOpened = false;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _userSettingsService: UserSettingsService,
        private _contactService: ContactService,
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
        const toggleFilterValue = await this._userSettingsService.getValue(`${AppSettings.Contact}:toggleFilter`);
        this.drawerFilterOpened = toggleFilterValue === '' ? false : toggleFilterValue === 'true';
        // console.log('drawerFilterOpened', this.drawerFilterOpened)
    }

    createContact(): void {
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    async toggleFilter() {
        this.drawerFilterOpened = !this.drawerFilterOpened;

        const value = this.drawerFilterOpened ? 'true' : 'false';
        await this._userSettingsService.setValue(`${AppSettings.Contact}:toggleFilter`, value);
    }

    changeView(): void {
        this._contactService.toggleViewList();
    }
}
