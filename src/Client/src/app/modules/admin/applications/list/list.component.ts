import { NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { ApplicationsService } from '../applications.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslocoModule } from '@ngneat/transloco';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SearchPipe } from 'app/pipes';
import { Application, ApplicationRole, ApplicationScope, ApplicationScopeGroup } from '../applications.types';
import { BackButtonComponent } from 'app/shared/components/back-button/back-button.component';
import { generateClass, trackByFn } from 'app/shared';
import { ApplicationGridComponent } from 'app/shared/components/application-grid/application-grid.component';
import { BaseSearchParameters, PaginatedList, defaultPaginatedList } from '../../../../shared/types/shared.types';
import { debounceTime, map } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApplicationGridItemClickEvent } from 'app/shared/components/application-grid/application-grid.types';

@UntilDestroy()
@Component({
    selector: 'app-application-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        FormsModule,
        ReactiveFormsModule,
        RouterOutlet,
        RouterLink,
        SearchPipe,
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        TranslocoModule,
        BackButtonComponent,
        ApplicationGridComponent,
    ],
})
export class ApplicationsListComponent implements OnInit {
    @Input() debounce = 300;
    @Input() minLength = 2;

    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';

    selectedApplication: Application;
    applications: PaginatedList<Application> = defaultPaginatedList;
    applicationRoles: ApplicationRole[];
    applicationScopes: ApplicationScope[];
    applicationScopeGroups: ApplicationScopeGroup[];

    generateClass = generateClass;
    trackByFn = trackByFn;

    searchInputControl: UntypedFormControl = new UntypedFormControl();
    orderBy = 'name';

    get queryParameters(): BaseSearchParameters {
        return {
            pattern: this.searchInputControl.value,
            pageIndex: this.applications.pageIndex,
            pageSize: this.applications.pageSize,
            orderBy: this.orderBy,
        };
    }

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _applicationsService: ApplicationsService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }
    }

    ngOnInit(): void {
        // Get the applications
        this._subscribeApplications();

        // Get the item
        this._subscribeApplication();

        // Get the Application Roles
        this._subscribeApplicationRoles();

        // Get the Application Scopes
        this._subscribeApplicationScopes();

        // Get the Application Scope Groups
        this._subscribeApplicationScopeGroups();

        // Subscribe to media query change
        this._subscribeMediaQueryChange();

        // Subscribe to the search field value changes
        this._subscribeSearchInputControlValueChanges();
    }

    private _subscribeApplications() {
        this._applicationsService.applications$
            .pipe(untilDestroyed(this))
            .subscribe((applications: PaginatedList<Application>) => {
                this.applications = applications;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    private _subscribeApplication() {
        this._applicationsService.application$.pipe(untilDestroyed(this)).subscribe((item: Application) => {
            this.selectedApplication = item;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    private _subscribeApplicationRoles() {
        this._applicationsService.applicationRoles$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<ApplicationRole>) => {
                this.applicationRoles = list.items;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    private _subscribeApplicationScopes() {
        this._applicationsService.applicationScopes$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<ApplicationScope>) => {
                this.applicationScopes = list.items;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    private _subscribeApplicationScopeGroups() {
        this._applicationsService.applicationScopeGroups$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<ApplicationScopeGroup>) => {
                this.applicationScopeGroups = list.items;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    private _subscribeMediaQueryChange() {
        this._fuseMediaWatcherService
            .onMediaQueryChange$('(min-width: 1440px)')
            .pipe(untilDestroyed(this))
            .subscribe(state => {
                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    private _subscribeSearchInputControlValueChanges() {
        this.searchInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe(value => {
                this._applicationsService
                    .getApplications({ ...this.queryParameters, pattern: value })
                    .pipe(untilDestroyed(this))
                    .subscribe();
            });
    }

    onApplicationClicked(event: ApplicationGridItemClickEvent): void {
        if (!event.item) {
            return;
        }

        this._router.navigate(['./', event.item.id], { relativeTo: this._activatedRoute });
    }

    createApplication(): void {
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    handlePageEvent(event: PageEvent): void {
        this._applicationsService
            .getApplications({ ...this.queryParameters, pageIndex: event.pageIndex, pageSize: event.pageSize })
            .pipe(untilDestroyed(this))
            .subscribe();
    }
}
