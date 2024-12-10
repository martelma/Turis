import { Guid } from 'guid-typescript';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslocoModule } from '@ngneat/transloco';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { generateClass } from 'app/shared';
import { ApplicationScope, Application } from '../../applications.types';
import { ApplicationsService } from '../../applications.service';
import { debounceTime, map, tap } from 'rxjs';
import { BackButtonComponent } from 'app/shared/components/back-button/back-button.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SearchPipe } from 'app/pipes';
import { CdModalComponent } from 'app/shared/components/cd-modal/cd-modal.component';
import { getSuccessModal, getDeletingModal } from 'app/shared/types/confirm-modal.types';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { trackByFn } from '../../../../../shared/utils';
import { PaginatedList } from '../../../../../shared/types/shared.types';

@UntilDestroy()
@Component({
    selector: 'app-application-scopes-list',
    templateUrl: './list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        RouterOutlet,
        RouterLink,
        SearchPipe,
        FormsModule,
        ReactiveFormsModule,
        MatSidenavModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatMenuModule,
        TranslocoModule,
        BackButtonComponent,
        CdModalComponent,
        BackButtonComponent,
    ],
})
export class ApplicationScopesListComponent implements OnInit {
    @Input() debounce = 500;

    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    drawerOpened = true;

    applicationId: string;
    application: Application;
    selectedScope: ApplicationScope;
    selectedScopeId: string;
    scopes: ApplicationScope[] = [];
    filteredScopes: ApplicationScope[] = [];

    isCreate = false;

    generateClass = generateClass;
    trackByFn = trackByFn;

    isCreateScope = false;
    isCreatingScope = false;

    searchScopesInputControl: UntypedFormControl = new UntypedFormControl();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _applicationsService: ApplicationsService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseConfirmationService: FuseConfirmationService,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }

        this.applicationId = this._activatedRoute.snapshot.params['appId'];
    }

    ngOnInit(): void {
        this._getApplicationScopes();

        this._subscribeApplication();

        this._subscribeActivatedRoute();

        this._subscribeApplicationScopes();

        this._subscribeApplicationScope();

        this._subscribeQueryMediaChanges();

        this._subscribeSearchScopesInputValueChanges();
    }

    private _getApplicationScopes(): void {
        this._applicationsService.getApplicationScopes(this.applicationId).pipe(untilDestroyed(this)).subscribe();
    }

    private _subscribeApplication(): void {
        this._applicationsService
            .getApplicationById(this.applicationId)
            .pipe(untilDestroyed(this))
            .subscribe((application: Application) => {
                this.application = application;

                this._changeDetectorRef.markForCheck();
            });
    }

    private _subscribeActivatedRoute(): void {
        this._activatedRoute.firstChild?.params
            ?.pipe(
                tap(params => {
                    this.selectedScopeId = params.scopeId;
                    this.isCreate = this.selectedScopeId === 'new';
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    private _subscribeApplicationScopes(): void {
        // Get the items
        this._applicationsService.applicationScopes$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<ApplicationScope>) => {
                this.scopes = list?.items ?? [];
                this.filteredScopes = this.scopes;

                if (this.isCreate) {
                    this.selectedScope = {
                        id: Guid.create().toString(),
                        name: '',
                        description: '',
                    };
                    this.createScope();
                } else {
                    if (list?.items?.length) {
                        if (this.selectedScopeId != null) {
                            this.selectedScope = list?.items.find(x => x.id === this.selectedScopeId);
                        }
                    }
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    private _subscribeApplicationScope(): void {
        // Get the item
        this._applicationsService.applicationScope$.pipe(untilDestroyed(this)).subscribe((item: ApplicationScope) => {
            if (this.selectedScope) {
                this.selectedScope = item;
                this.selectedScopeId = item?.id;
            }

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    private _subscribeQueryMediaChanges(): void {
        // Subscribe to media query change
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

    private _subscribeSearchScopesInputValueChanges(): void {
        this.searchScopesInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe((value: string) => {
                this.filteredScopes = this.scopes.filter(x => x.name?.toLowerCase().includes(value.toLowerCase()));

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    createScope(): void {
        this.selectedScope = {
            name: '',
            description: '',
            scopeGroupId: null,
        };
        this.selectedScopeId = this.selectedScope?.id;
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    onScopeSelected(scope: ApplicationScope): void {
        this.selectedScope = scope;
        this.selectedScopeId = this.selectedScope?.id;
        this._router.navigate(['./', scope.id], { relativeTo: this._activatedRoute });
    }

    closeDetails(): void {
        this.selectedScope = null;
        this.selectedScopeId = null;

        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
    }

    // Scopes

    saveScope(scope: ApplicationScope): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const newScope: ApplicationScope = {
            ...this.selectedScope,
            ...scope,
        };

        // When creating a scope, it is added automatically to the current scope
        /*if (!newScope.scopeIds?.length) {
            newScope.scopeIds = [this.selectedScope?.id];
        }*/

        this._applicationsService
            .saveApplicationScope(this.applicationId, newScope, this.isCreateScope)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());
                this.isCreatingScope = false;

                // Updates the lists
                this._applicationsService
                    .getApplicationScopeById(this.applicationId, this.selectedScope?.id)
                    .pipe(untilDestroyed(this))
                    .subscribe();

                this._applicationsService
                    .getApplicationScopes(this.applicationId)
                    .pipe(untilDestroyed(this))
                    .subscribe();

                this._applicationsService
                    .getApplicationScopes(this.applicationId)
                    .pipe(untilDestroyed(this))
                    .subscribe();
            });
    }

    deleteScope(scope: ApplicationScope): void {
        this._fuseConfirmationService
            .open(getDeletingModal())
            .afterClosed()
            .subscribe(r => {
                if (r === 'confirmed') {
                    this._applicationsService
                        .deleteApplicationScope(this.applicationId, scope.id)
                        .pipe(
                            tap(() => {
                                this._fuseConfirmationService.open(getSuccessModal());
                            }),
                            untilDestroyed(this),
                        )
                        .subscribe();
                }
            });
    }
}
