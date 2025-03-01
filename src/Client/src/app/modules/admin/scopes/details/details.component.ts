import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, debounceTime, map } from 'rxjs';
import { TranslocoModule } from '@ngneat/transloco';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApplicationScopesListComponent } from '../list/list.component';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { trackByFn } from 'app/shared';
import { emptyGuid, PaginatedList } from 'app/shared/types/shared.types';
import { MatTabsModule } from '@angular/material/tabs';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { isUserOwner } from 'app/core/user/user.utils';
import { ApplicationScopesFormComponent } from '../form/form.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset/scroll-reset.directive';

@UntilDestroy()
@Component({
    standalone: true,
    styleUrls: ['./details.component.scss'],
    selector: 'app-application-scopes-details',
    imports: [
        NgIf,
        NgFor,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatTabsModule,
        MatMenuModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        TranslocoModule,
        FuseScrollResetDirective,
        ApplicationScopesFormComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './details.component.html',
})
export class ApplicationScopesDetailsComponent implements OnInit {
    @Input() debounce = 300;

    @ViewChild(ApplicationScopesFormComponent) form!: ApplicationScopesFormComponent;

    public applicationId: string;

    // Scopes
    public scopeId: string;
    public scope: ApplicationScope;
    public scopeRoles: PaginatedList<ApplicationRole>;
    public scopeUsers: PaginatedList<User>;

    public isCreate = false;

    public allApplicationScopeGroups: ApplicationScopeGroup[] = [];

    public isCreatingScope = false;

    public applicationScopes: ApplicationScope[] = [];

    scopeRolesSearchInputControl: UntypedFormControl = new UntypedFormControl();
    scopeUsersSearchInputControl: UntypedFormControl = new UntypedFormControl();

    // User
    user: User;
    isUserOwner = false;

    trackByFn = trackByFn;
    emptyGuid = emptyGuid;

    constructor(
        private _userService: UserService,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _applicationScopesListComponent: ApplicationScopesListComponent,
        private _applicationsService: ApplicationsService,
        private _router: Router,
    ) {}

    ngOnInit(): void {
        this._subscribeUser();

        this._subscribeScopeRolesFilter();

        this._subscribeScopeUsersFilter();

        this._subscribeApplicationScope();

        this._subscribeApplicationScopeRoles();

        this._subscribeApplicationScopeUsers();

        this._subscribeApplicationScopes();

        this._subscribeApplicationScopeGroups();

        this._loadData();
    }

    private _subscribeUser(): void {
        this._userService.user$.pipe(untilDestroyed(this)).subscribe((user: User) => {
            this.user = user;

            this.isUserOwner = isUserOwner(this.user);
        });
    }

    private _subscribeScopeRolesFilter() {
        // Subscribe to the search field value changes
        this.scopeRolesSearchInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe((value: string) => {
                if (!this.scopeId) {
                    return;
                }

                if (this.isCreate) {
                    return;
                }

                this._applicationsService
                    .getApplicationScopeRoles(this.applicationId, this.scopeId, {
                        pageIndex: 0,
                        pageSize: this.scopeRoles.pageSize,
                        pattern: value,
                    })
                    .pipe(untilDestroyed(this))
                    .subscribe();
            });
    }

    private _subscribeScopeUsersFilter() {
        // Subscribe to the search field value changes
        this.scopeUsersSearchInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe((value: string) => {
                if (!this.scopeId) {
                    return;
                }

                if (this.isCreate) {
                    return;
                }

                this._applicationsService
                    .getApplicationScopeUsers(this.applicationId, this.scopeId, {
                        pageIndex: 0,
                        pageSize: this.scopeUsers.pageSize,
                        pattern: value,
                    })
                    .pipe(untilDestroyed(this))
                    .subscribe();
            });
    }

    private _subscribeApplicationScope(): void {
        this._applicationsService.applicationScope$.pipe(untilDestroyed(this)).subscribe((scope: ApplicationScope) => {
            this.scope = scope;

            this._changeDetectorRef.markForCheck();

            if (this.isCreate) {
                return;
            }

            this._applicationsService
                .getApplicationScopeRoles(this.applicationId, this.scopeId)
                .pipe(untilDestroyed(this))
                .subscribe();

            this._applicationsService
                .getApplicationScopeUsers(this.applicationId, this.scopeId)
                .pipe(untilDestroyed(this))
                .subscribe();
        });
    }

    private _subscribeApplicationScopeRoles(): void {
        this._applicationsService.applicationScopeRoles$
            .pipe(untilDestroyed(this))
            .subscribe((roles: PaginatedList<ApplicationRole>) => {
                this.scopeRoles = roles;

                this._changeDetectorRef.markForCheck();
            });
    }

    private _subscribeApplicationScopeUsers(): void {
        this._applicationsService.applicationScopeUsers$
            .pipe(untilDestroyed(this))
            .subscribe((users: PaginatedList<User>) => {
                this.scopeUsers = users;

                this._changeDetectorRef.markForCheck();
            });
    }

    private _subscribeApplicationScopes(): void {
        this._applicationsService.applicationScopes$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<ApplicationScope>) => {
                this.applicationScopes = list.items;

                this._changeDetectorRef.markForCheck();
            });
    }

    private _subscribeApplicationScopeGroups(): void {
        this._applicationsService.applicationScopeGroups$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<ApplicationScopeGroup>) => {
                this.allApplicationScopeGroups = list.items;

                this._changeDetectorRef.markForCheck();
            });
    }

    private _loadData(): void {
        combineLatest([this._activatedRoute.parent.params, this._activatedRoute.params])
            .pipe(untilDestroyed(this))
            .subscribe(([parentParams, params]) => {
                // Activates the create user mode
                this.isCreate = params.scopeId === 'new';

                this.applicationId = parentParams['appId'];
                this.scopeId = params.scopeId;

                if (this.isCreate) {
                    this._applicationScopesListComponent.createScope();
                }

                this._getApplicationScope();

                this._getApplicationScopeGroups();
            });
    }

    private _getApplicationScope(): void {
        this._applicationsService
            .getApplicationScopeById(this.applicationId, this.scopeId)
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    private _getApplicationScopeGroups(): void {
        this._applicationsService
            .getApplicationScopeGroups(this.applicationId, true, { pageIndex: 0, pageSize: 999 })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    updateOrCreateScope(): void {
        const scope = this.form.getRawValue();

        this._applicationsService
            .saveApplicationScope(this.applicationId, scope, this.isCreate)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());

                if (this.isCreate) {
                    this.closeCreateScopeDrawer();
                }
            });
    }

    closeDetails(): void {
        this.scope = null;
        this._applicationScopesListComponent?.closeDetails();
    }

    closeCreateScopeDrawer(): Promise<MatDrawerToggleResult> {
        // Navigate to the scope list component
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });

        // Close the matDrawer
        return this._applicationScopesListComponent?.matDrawer?.close();
    }

    createScope(): void {
        this._applicationScopesListComponent?.createScope();
    }

    deleteScope(): void {
        this._applicationScopesListComponent?.deleteScope(this.scope);
    }

    editRole(roleId: string): void {
        this._router.navigate([`/admin/applications/${this.applicationId}/roles/${roleId}`]);
    }

    editUser(userId: string): void {
        this._router.navigate([`/admin/users/${userId}`]);
    }

    handleScopeRolesPageEvent(event: PageEvent): void {
        if (!this.scopeId) {
            return;
        }

        if (this.isCreate) {
            return;
        }

        this._applicationsService
            .getApplicationScopeRoles(this.applicationId, this.scopeId, {
                pageIndex: event.pageIndex,
                pageSize: event.pageSize,
                pattern: this.scopeRolesSearchInputControl.value ?? '',
            })
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    handleScopeUsersPageEvent(event: PageEvent): void {
        if (!this.scopeId) {
            return;
        }

        if (this.isCreate) {
            return;
        }

        this._applicationsService
            .getApplicationScopeUsers(this.applicationId, this.scopeId, {
                pageIndex: event.pageIndex,
                pageSize: event.pageSize,
                pattern: this.scopeUsersSearchInputControl.value ?? '',
            })
            .pipe(untilDestroyed(this))
            .subscribe();
    }
}
