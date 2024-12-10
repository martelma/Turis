import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { KeyValuePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { getSuccessModal } from '../../../../../shared/types/confirm-modal.types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApplicationRole, ApplicationScope, ApplicationScopeGroup } from '../../applications.types';
import { ApplicationsService } from '../../applications.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, tap } from 'rxjs';
import { TranslocoModule } from '@ngneat/transloco';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApplicationRolesListComponent } from '../list/list.component';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FuseCardComponent } from '@fuse/components/card';
import { trackByFn } from 'app/shared';
import { emptyGuid, PaginatedList } from 'app/shared/types/shared.types';
import { MatTabsModule } from '@angular/material/tabs';
import { isUserOwner } from 'app/core/user/user.utils';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { MatMenuModule } from '@angular/material/menu';
import _ from 'lodash';
import { A11yModule } from '@angular/cdk/a11y';

@UntilDestroy()
@Component({
    standalone: true,
    styleUrls: ['./details.component.scss'],
    selector: 'app-application-roles-details',
    imports: [
        NgIf,
        NgFor,
        NgClass,
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        KeyValuePipe,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatTabsModule,
        MatMenuModule,
        TranslocoModule,
        FuseCardComponent,
        A11yModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './details.component.html',
})
export class ApplicationRolesDetailsComponent implements OnInit {
    public applicationId: string;

    public roleId: string;

    public role: ApplicationRole;
    public form: FormGroup;

    public isCreate = false;

    allApplicationScopes: ApplicationScope[] = [];

    public groupedApplicationScopes: {
        [x: string]: Pick<
            ApplicationScope,
            'name' | 'description' | 'applicationId' | 'id' | 'roleIds' | 'scopeGroupId'
        >[];
    };

    public allApplicationScopeGroups: ApplicationScopeGroup[] = [];

    public isCreatingScopeGroup = false;

    public applicationScopes: ApplicationScope[] = [];

    user: User;

    trackByFn = trackByFn;
    isUserOwner = false;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _applicationRolesListComponent: ApplicationRolesListComponent,
        private _applicationsService: ApplicationsService,
        private _userService: UserService,
        private _router: Router,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }

        this._generateFormGroups();
    }

    ngOnInit(): void {
        this._subscribeUser();

        this._subscribeApplicationRole();

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

    private _generateFormGroups(): void {
        this.form = this._formBuilder.group({
            name: ['', Validators.required],
            description: [''],
        });
    }

    private _subscribeApplicationRole(): void {
        // Get the role
        this._applicationsService.applicationRole$.pipe(untilDestroyed(this)).subscribe((role: ApplicationRole) => {
            // Get the role
            this.role = role;

            if (role != null) {
                // Fill the form
                this.form.patchValue({ ...role, description: role?.description ?? '' });
            }

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    private _subscribeApplicationScopes(): void {
        // Get the scopes
        this._applicationsService.applicationScopes$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<ApplicationScope>) => {
                this.allApplicationScopes = list.items;

                this.groupedApplicationScopes = _.mapValues(_.groupBy(list.items, 'scopeGroupName'), clist =>
                    clist.map(car => _.omit(car, 'scopeGroupName')),
                );

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    private _subscribeApplicationScopeGroups(): void {
        // Get the scope groups
        this._applicationsService.applicationScopeGroups$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<ApplicationScopeGroup>) => {
                this.allApplicationScopeGroups = list.items;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    private _loadData(): void {
        combineLatest([this._activatedRoute.parent.params, this._activatedRoute.params])
            .pipe(
                tap(([parentParams, params]) => {
                    // Activates the create user mode
                    this.isCreate = params.roleId === 'new';

                    this.applicationId = parentParams['appId'];
                    this.roleId = params.roleId;

                    if (this.isCreate) {
                        this._applicationRolesListComponent.createRole();
                    }

                    this._getApplicationRole();

                    this._getApplicationScopes();

                    this._getApplicationScopeGroups();
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    private _getApplicationRole(): void {
        this._applicationsService
            .getApplicationRoleById(this.applicationId, this.roleId)
            .pipe(untilDestroyed(this))
            .subscribe();
    }

    private _getApplicationScopes(): void {
        this._applicationsService.getApplicationScopes(this.applicationId).pipe(untilDestroyed(this)).subscribe();
    }

    private _getApplicationScopeGroups(): void {
        this._applicationsService.getApplicationScopeGroups(this.applicationId).pipe(untilDestroyed(this)).subscribe();
    }

    updateOrCreateRole(): void {
        this.role = { ...this.role, ...this.form.value };

        if (this.isCreate) {
            this.role.id = emptyGuid;
        }

        this._applicationsService
            .saveApplicationRole(this.applicationId, this.role, this.isCreate)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());

                if (this.isCreate) {
                    // Alternatively we could select the newly created element in the parent list component when created
                    this.closeCreateRoleDrawer();
                }
            });
    }

    deleteRole(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Role',
            message: 'Are you sure you want to remove this role? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation
            .afterClosed()
            .pipe(untilDestroyed(this))
            .subscribe(result => {
                // If the confirm button pressed...
                if (result === 'confirmed') {
                    // Delete the application on the server
                    this._applicationsService.deleteApplicationRole(this.applicationId, this.role.id).subscribe(() => {
                        this._fuseConfirmationService.open(getSuccessModal());

                        // Close the details
                        this.closeDetails();
                    });
                }
            });
    }

    closeDetails(): void {
        this.role = null;
        this._applicationRolesListComponent?.closeDetails();
    }

    isScopeChecked(scopeId: string): boolean {
        return (
            this.role?.scopes?.find(s => {
                return s?.id === scopeId;
            }) != null
        );
    }

    isScopeGroupChecked(scopeGroupId: string): boolean {
        return this.role?.scopes?.some(
            () => this.allApplicationScopes?.find(scope => scope.id === scope.id)?.scopeGroupId === scopeGroupId,
        );
    }

    toggleScope(scopeId: string): void {
        if (this.isScopeChecked(scopeId)) {
            this.role.scopes = this.role?.scopes?.filter(scope => scope.id !== scopeId);
        } else {
            const scope = this.allApplicationScopes?.find(s => s.id === scopeId);
            if (scope) {
                this.role?.scopes?.push(scope);
            }
        }
    }

    toggleScopeGroup(scopeGroupId: string): void {
        if (this.isScopeGroupChecked(scopeGroupId)) {
            this.role.scopes = this.role?.scopes?.filter(
                scope => this.allApplicationScopes?.find(s => s.id === scope.id)?.scopeGroupId !== scopeGroupId,
            );
        } else {
            this.allApplicationScopes?.forEach(scope => {
                if (scope.scopeGroupId === scopeGroupId && !this.role?.scopes?.find(s => s.id === scope.id)) {
                    this.role?.scopes?.push(scope);
                }
            });
        }
    }

    closeCreateRoleDrawer(): Promise<MatDrawerToggleResult> {
        // Navigate to the role list component
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });

        // Close the matDrawer
        return this._applicationRolesListComponent?.matDrawer?.close();
    }

    createScope(): void {
        this._applicationRolesListComponent?.createScope();
    }

    deleteScope(scope: ApplicationScope): void {
        this._applicationRolesListComponent?.deleteScope(scope);
    }

    openScopesEditModal(scope?: ApplicationScope): void {
        this._applicationRolesListComponent?.openScopesEditModal(scope);
    }

    editUser(userId: string): void {
        this._router.navigate([`/users/${userId}`]);
    }

    unselectAll(): void {
        this.role.scopes = [];
    }

    selectAll(): void {
        this.role.scopes = this.allApplicationScopes;
    }

    unselectAllInScopeGroup(scopeGroupName: string): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const found = Object.entries(this.groupedApplicationScopes).find(([key, _]) => key === scopeGroupName);
        if (found) {
            found[1].forEach(scope => {
                this.role.scopes = this.role?.scopes?.filter(s => s.id !== scope.id);
            });
        }
    }

    selectAllInScopeGroup(scopeGroupName: string): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const found = Object.entries(this.groupedApplicationScopes).find(([key, _]) => key === scopeGroupName);
        console.log(found);
        if (found) {
            found[1].forEach(scope => {
                if (this.role?.scopes?.find(s => s.id === scope.id) == null) {
                    this.role?.scopes?.push(scope);
                }
            });
        }
    }
}
