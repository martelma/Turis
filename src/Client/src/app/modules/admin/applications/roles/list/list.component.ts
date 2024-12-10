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
import { ApplicationRole, ApplicationScope, Application } from '../../applications.types';
import { ApplicationsService } from '../../applications.service';
import { debounceTime, map, tap } from 'rxjs';
import { BackButtonComponent } from 'app/shared/components/back-button/back-button.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SearchPipe } from 'app/pipes';
import { CdModalComponent } from 'app/shared/components/cd-modal/cd-modal.component';
import { getSuccessModal, getDeletingModal } from 'app/shared/types/confirm-modal.types';
import { ApplicationRoleScopeModalComponent } from '../scope-modal/scope-modal.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { trackByFn } from '../../../../../shared/utils';
import { PaginatedList } from '../../../../../shared/types/shared.types';

@UntilDestroy()
@Component({
    selector: 'app-application-roles-list',
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
        ApplicationRoleScopeModalComponent,
        BackButtonComponent,
    ],
})
export class ApplicationRolesListComponent implements OnInit {
    @Input() debounce = 500;

    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    drawerOpened = true;

    applicationId: string;
    application: Application;
    selectedRole: ApplicationRole;
    selectedRoleId: string;
    roles: ApplicationRole[] = [];
    filteredRoles: ApplicationRole[] = [];

    isCreate = false;

    generateClass = generateClass;
    trackByFn = trackByFn;

    public scopesEditModal = false;
    public isCreateScope = false;
    public isCreatingScope = false;
    public selectedScope: ApplicationScope = null;

    searchRolesInputControl: UntypedFormControl = new UntypedFormControl();

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
        this._getApplicationRoles();

        this._subscribeApplication();

        this._subscribeActivatedRoute();

        this._subscribeApplicationRoles();

        this._subscribeApplicationRole();

        this._subscribeQueryMediaChanges();

        this._subscribeSearchRolesInputValueChanges();
    }

    private _getApplicationRoles(): void {
        this._applicationsService.getApplicationRoles(this.applicationId).pipe(untilDestroyed(this)).subscribe();
    }

    private _subscribeApplication(): void {
        this._applicationsService
            .getApplicationById(this.applicationId)
            .pipe(untilDestroyed(this))
            .subscribe((application: Application) => {
                this.application = application;
            });
    }

    private _subscribeActivatedRoute(): void {
        this._activatedRoute.firstChild?.params
            ?.pipe(
                tap(params => {
                    this.selectedRoleId = params.roleId;
                    this.isCreate = this.selectedRoleId === 'new';
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    private _subscribeApplicationRoles(): void {
        // Get the items
        this._applicationsService.applicationRoles$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<ApplicationRole>) => {
                this.roles = list?.items ?? [];
                this.filteredRoles = this.roles;

                if (this.isCreate) {
                    this.selectedRole = {
                        id: Guid.create().toString(),
                        name: '',
                        description: '',
                    };
                    this.createRole();
                } else {
                    if (list?.items?.length) {
                        if (this.selectedRoleId != null) {
                            this.selectedRole = list?.items.find(x => x.id === this.selectedRoleId);
                        }
                    }
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    private _subscribeApplicationRole(): void {
        // Get the item
        this._applicationsService.applicationRole$.pipe(untilDestroyed(this)).subscribe((item: ApplicationRole) => {
            if (this.selectedRole) {
                this.selectedRole = item;
                this.selectedRoleId = item?.id;
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

    private _subscribeSearchRolesInputValueChanges(): void {
        this.searchRolesInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe((value: string) => {
                this.filteredRoles = this.roles.filter(x => x.name?.toLowerCase().includes(value.toLowerCase()));

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

    createRole(): void {
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    onRoleSelected(role: ApplicationRole): void {
        this.selectedRole = role;
        this.selectedRoleId = this.selectedRole?.id;
        this._router.navigate(['./', role.id], { relativeTo: this._activatedRoute });
    }

    closeDetails(): void {
        this.selectedRole = null;
        this.selectedRoleId = null;

        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
    }

    // Scopes

    openScopesEditModal(scope?: ApplicationScope): void {
        this.selectedScope = scope;
        this.isCreateScope = false;
        this.isCreatingScope = true;
        this.scopesEditModal = true;
    }

    createScope(): void {
        this.selectedScope = null;
        this.isCreateScope = true;
        this.isCreatingScope = true;
        this.scopesEditModal = true;
    }

    saveScope(scope: ApplicationScope): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const newScope: ApplicationScope = {
            ...this.selectedScope,
            ...scope,
        };

        // When creating a scope, it is added automatically to the current role
        if (!newScope.roleIds?.length) {
            newScope.roleIds = [this.selectedRole?.id];
        }

        if (newScope.scopeGroupId === '') {
            delete newScope.scopeGroupId;
        }

        this._applicationsService
            .saveApplicationScope(this.applicationId, newScope, this.isCreateScope)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());
                this.isCreatingScope = false;

                // Updates the lists
                this._applicationsService
                    .getApplicationRoleById(this.applicationId, this.selectedRole?.id)
                    .pipe(untilDestroyed(this))
                    .subscribe();

                this._applicationsService
                    .getApplicationScopes(this.applicationId)
                    .pipe(untilDestroyed(this))
                    .subscribe();

                this._applicationsService
                    .getApplicationScopeGroups(this.applicationId)
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
