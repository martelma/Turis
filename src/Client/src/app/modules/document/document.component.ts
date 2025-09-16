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
import { DocumentSidebarComponent } from './document-sidebar/document-sidebar.component';
import { NgTemplateOutlet } from '@angular/common';

@UntilDestroy()
@Component({
    selector: 'app-document',
    templateUrl: './document.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgTemplateOutlet,
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        DocumentSidebarComponent,
        RouterOutlet,
        TranslocoModule,
    ],
})
export class DocumentComponent implements OnInit, AfterViewInit {
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
        const toggleFilterValue = await this._userSettingsService.getValue(`${AppSettings.Document}:toggleFilter`);
        this.drawerFilterOpened = toggleFilterValue === '' ? false : toggleFilterValue === 'true';
    }

    createDocument(): void {
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    async toggleFilter() {
        this.drawerFilterOpened = !this.drawerFilterOpened;

        const value = this.drawerFilterOpened ? 'true' : 'false';
        await this._userSettingsService.setValue(`${AppSettings.Document}:toggleFilter`, value);
    }
}
