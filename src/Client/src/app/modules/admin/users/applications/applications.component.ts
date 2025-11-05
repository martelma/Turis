import { CommonModule, NgClass, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { AvatarUsersService } from '../avatar-users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { ApplicationsService } from 'app/modules/admin/applications/applications.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
    Application,
    ApplicationRole,
    ApplicationScope,
    ApplicationScopeGroup,
} from '../../applications/applications.types';
import { User } from 'app/core/user/user.types';
import { TranslocoModule } from '@jsverse/transloco';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SearchPipe } from 'app/pipes';
import { FuseCardComponent } from '@fuse/components/card';
import { trackByFn } from '../../../../shared/utils';
import { MatMenuModule } from '@angular/material/menu';
import { fuseAnimations } from '@fuse/animations';
import { BackButtonComponent } from 'app/shared/components/back-button/back-button.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaginatedList } from '../../../../shared/types/shared.types';
import { FuseAlertComponent } from '../../../../../@fuse/components/alert/alert.component';
import { debounceTime, map, tap } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { CdModalComponent } from 'app/shared/components/cd-modal/cd-modal.component';
import { UserApplicationScopeModalComponent } from './scope-modal/scope-modal.component';
import { getDeletingModal, getSuccessModal } from 'app/shared/types/confirm-modal.types';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserApplicationScopeGroupModalComponent } from './scope-group-modal/scope-group-modal.component';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatOptionSelectionChange } from '@angular/material/core';

@UntilDestroy()
@Component({
    selector: 'app-contact-applications',
    styleUrls: ['./applications.component.scss'],
    templateUrl: './applications.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgFor,
        NgClass,
        NgSwitch,
        NgSwitchCase,
        CommonModule,
        SearchPipe,
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatGridListModule,
        MatMenuModule,
        MatTooltipModule,
        MatTabsModule,
        MatAutocompleteModule,
        TranslocoModule,
        FuseCardComponent,
        BackButtonComponent,
        FuseAlertComponent,

        CdModalComponent,
        UserApplicationScopeModalComponent,
        UserApplicationScopeGroupModalComponent,
    ],
})
export class ContactApplicationsComponent implements OnInit {
    @Input() debounce = 500;

    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened = true;

    cols = 4;

    // Applications
    searchApplicationsInputControl: UntypedFormControl = new UntypedFormControl();
    applications: Application[] = [];
    selectedApplication: Application = null;
    selectedApplicationId: string;
    user: User;

    // Copy from User
    applicationUsersControl = new FormControl('');
    filteredUsers: User[] = [];
    userSelected: User;

    // Roles
    searchRolesInputControl: UntypedFormControl = new UntypedFormControl();
    filteredRoles: ApplicationRole[] = [];
    roles: ApplicationRole[] = [];

    // Scopes
    searchScopesInputControl: UntypedFormControl = new UntypedFormControl();
    filteredScopes: ApplicationScope[] = [];
    scopes: ApplicationScope[] = [];

    // Scope Groups
    searchScopeGroupsInputControl: UntypedFormControl = new UntypedFormControl();
    filteredScopeGroups: ApplicationScopeGroup[] = [];
    scopeGroups: ApplicationScopeGroup[] = [];

    isCreate = false;
    creatingForm: FormGroup = null;

    trackByFn = trackByFn;

    // Scopes Modal
    scopesEditModal = false;
    isCreateScope = false;
    isCreatingScope = false;
    selectedScope: ApplicationScope = null;

    // Scope Groups Modal
    scopeGroupsEditModal = false;
    isCreateScopeGroup = false;
    isCreatingScopeGroup = false;
    selectedScopeGroup: ApplicationScopeGroup = null;

    constructor(
        private _usersService: AvatarUsersService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _applicationsService: ApplicationsService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const queryParams = { ...snapshot.queryParams };
        if ('otp' in queryParams) {
            delete queryParams.otp;
            this._router.navigate([], { queryParams });
        }

        this.selectedApplicationId = this._activatedRoute.snapshot.params['applicationId'];
    }

    ngOnInit(): void {
        this._applicationUsersControlValueChanges();

        this._subscribeApplications();

        this._subscribeUser();

        this._subscribeMediaChanges();

        this._subscribeSearchApplicationsInputValueChanges();

        this._subscribeSearchRolesInputValueChanges();

        this._subscribeSearchScopesInputValueChanges();

        this._subscribeSearchScopeGroupsInputValueChanges();
    }

    private _applicationUsersControlValueChanges(): void {
        this.applicationUsersControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe((value: User | string) => {
                this.filteredUsers = this._filter(value);
            });
    }

    isUser(value: any): value is User {
        return typeof value !== 'string' && 'id' in value;
    }

    private _filter(value: User | string): User[] {
        if (this.isUser(value)) {
            return [value];
        }

        if (!value) {
            return this.selectedApplication?.users ?? [];
        }

        const filterValue = value?.toLowerCase();
        return this.selectedApplication?.users.filter(
            option =>
                option.firstName.toLowerCase().includes(filterValue) ||
                option.lastName.toLowerCase().includes(filterValue),
        );
    }

    private _subscribeApplications(): void {
        // Applications
        this._applicationsService.applications$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<Application>) => {
                this.applications = list?.items ?? [];

                if (list?.items?.length) {
                    if (this.selectedApplicationId == null) {
                        this.selectedApplicationId = this.selectedApplication?.id;
                        this.selectedApplication = list?.items[0];
                    } else {
                        this.selectedApplication = list?.items.find(x => x.id === this.selectedApplicationId);
                    }

                    this.showApplication(this.selectedApplication);
                }
            });
    }

    private _subscribeUser(): void {
        // Get the user
        this._usersService.user$.pipe(untilDestroyed(this)).subscribe((user: User) => {
            this.user = user;

            this._changeDetectorRef.detectChanges();
        });
    }

    private _subscribeMediaChanges(): void {
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$.pipe(untilDestroyed(this)).subscribe(({ matchingAliases }) => {
            // Set the drawerMode and drawerOpened
            if (matchingAliases.includes('lg')) {
                this.drawerMode = 'side';
                this.drawerOpened = true;
            } else {
                this.drawerMode = 'over';
                this.drawerOpened = false;
            }

            // Responsive grid
            if (matchingAliases.includes('xl')) {
                this.cols = 4;
            } else {
                if (matchingAliases.length === 1 && matchingAliases[0] === 'sm') {
                    this.cols = 1;
                } else {
                    this.cols = 2;
                }
            }
        });
    }

    private _subscribeSearchApplicationsInputValueChanges(): void {
        this.searchApplicationsInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe((value: string) => {
                this._applicationsService.getApplications({ pattern: value }).subscribe();
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
            });
    }

    private _subscribeSearchScopeGroupsInputValueChanges(): void {
        this.searchScopeGroupsInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe((value: string) => {
                this.filteredScopeGroups = this.scopeGroups.filter(x =>
                    x.name?.toLowerCase().includes(value.toLowerCase()),
                );
            });
    }

    showApplication(application: Application): void {
        this.selectedApplication = application;
        this.selectedApplicationId = this.selectedApplication?.id;

        this._applicationsService
            .getApplicationById(this.selectedApplicationId)
            .pipe(untilDestroyed(this))
            .subscribe(application => {
                this.selectedApplication = application;
                this.filteredUsers = application?.users;

                this.roles = application?.roles;
                this.filteredRoles = this.roles;

                this.scopes = application?.scopes;
                this.filteredScopes = this.scopes;

                this.scopeGroups = application?.scopeGroups;
                this.filteredScopeGroups = this.scopeGroups;
            });

        // Close the drawer on 'over' mode
        if (this.drawerMode === 'over') {
            this.drawer.close();
        }
    }

    displayFn(user: User): string {
        return user ? `${user?.firstName} ${user?.lastName}` : '';
    }

    addRole(role: ApplicationRole): void {
        const newUser: any = {
            userId: this.user.id,
            email: this.user.email,
            firstName: this.user.firstName,
            isActive: this.user.isActive,
            lastName: this.user.lastName,
            userName: this.user.userName,
            roles: [],
        };

        this.user?.applications?.forEach(app => {
            app.roles.forEach(r => {
                newUser.roles.push(r.id.toLowerCase());
            });
        });

        newUser.roles.push(role.id.toLowerCase());
        this._updateUser(newUser);
    }

    removeRole(role: ApplicationRole): void {
        const newUser: any = {
            userId: this.user.id,
            email: this.user.email,
            firstName: this.user.firstName,
            isActive: this.user.isActive,
            lastName: this.user.lastName,
            userName: this.user.userName,
            roles: [],
        };

        this.user?.applications?.forEach(app => {
            app.roles.forEach(r => {
                newUser.roles.push(r.id.toLowerCase());
            });
        });

        newUser.roles.splice(newUser.roles.indexOf(role.id.toLowerCase()), 1);
        this._updateUser(newUser);
    }

    hasUserRole(role: ApplicationRole): boolean {
        return (
            this.user?.applications
                ?.find(app => app.id.toLowerCase() === this.selectedApplication?.id.toLowerCase())
                ?.roles.find(r => r.id.toLowerCase() === role.id.toLowerCase()) !== undefined
        );
    }

    editRole(roleId: ApplicationRole): void {
        this._router.navigate([`/applications/${this.selectedApplication?.id}/roles/${roleId.id}`]);
    }

    createRole(): void {
        this._router.navigate([`/applications/${this.selectedApplication?.id}/roles`, 'new'], {
            relativeTo: this._activatedRoute,
        });
    }

    createScope(): void {
        this.selectedScope = null;
        this.isCreateScope = true;
        this.isCreatingScope = true;
        this.scopesEditModal = true;
    }

    editScope(scope?: ApplicationScope): void {
        this.selectedScope = scope;
        this.isCreateScope = false;
        this.isCreatingScope = true;
        this.scopesEditModal = true;
    }

    saveScope(scope: ApplicationScope): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const newScope: ApplicationScope = {
            ...this.selectedScope,
            ...scope,
        };

        // When creating a scope, it is added automatically to all the roles within the application
        if (!newScope.roleIds?.length) {
            newScope.roleIds = this.selectedApplication.roles.map(x => x.id);
        }

        if (newScope.scopeGroupId === '') {
            delete newScope.scopeGroupId;
        }

        this._applicationsService
            .saveApplicationScope(this.selectedApplication?.id, newScope, this.isCreateScope)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());
                this.isCreatingScope = false;

                this._applicationsService
                    .getApplicationScopes(this.selectedApplication?.id)
                    .pipe(untilDestroyed(this))
                    .subscribe();

                this._applicationsService
                    .getApplicationScopeGroups(this.selectedApplication?.id)
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
                        .deleteApplicationScope(this.selectedApplication?.id, scope.id)
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

    openScopePage(applicationId: string, scopeId?: string): void {
        if (scopeId) {
            this._router.navigate([`/applications/${applicationId}/scopes/${scopeId}`]);
        } else {
            this._router.navigate([`/applications/${applicationId}/scopes`]);
        }
    }

    createScopeGroup(): void {
        this.selectedScopeGroup = null;
        this.isCreateScopeGroup = true;
        this.isCreatingScopeGroup = true;
        this.scopeGroupsEditModal = true;
    }

    editScopeGroup(scopeGroup?: ApplicationScopeGroup): void {
        this.selectedScopeGroup = scopeGroup;
        this.isCreateScopeGroup = false;
        this.isCreatingScopeGroup = true;
        this.scopeGroupsEditModal = true;
    }

    saveScopeGroup(scopeGroup: ApplicationScopeGroup): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const newScopeGroup: ApplicationScopeGroup = {
            ...this.selectedScopeGroup,
            ...scopeGroup,
        };

        // When creating a scope, it is added automatically to all the roles within the application
        /*if (!newScopeGroup.scopes?.length) {
                newScopeGroup.scopes = this.selectedApplication.roles.map(x => x.id);
            }*/

        this._applicationsService
            .saveApplicationScopeGroup(this.selectedApplication?.id, newScopeGroup, this.isCreateScopeGroup)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());
                this.isCreatingScopeGroup = false;

                this._applicationsService
                    .getApplicationScopes(this.selectedApplication?.id)
                    .pipe(untilDestroyed(this))
                    .subscribe();

                this._applicationsService
                    .getApplicationScopeGroups(this.selectedApplication?.id)
                    .pipe(untilDestroyed(this))
                    .subscribe();
            });
    }

    deleteScopeGroup(scopeGroup: ApplicationScopeGroup): void {
        this._fuseConfirmationService
            .open(getDeletingModal())
            .afterClosed()
            .subscribe(r => {
                if (r === 'confirmed') {
                    this._applicationsService
                        .deleteApplicationScopeGroup(this.selectedApplication?.id, scopeGroup.id)
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

    private _updateUser(user: any): void {
        this._usersService.updateUser(user).subscribe();
    }

    showUser(): void {
        this._router.navigate(['../'], {
            relativeTo: this._activatedRoute,
        });
    }

    getScopeGroup(scopeGroupId: string): ApplicationScopeGroup {
        return this.scopeGroups?.find(x => x.id.toLowerCase() === scopeGroupId?.toLowerCase());
    }

    onUserSelected(user: MatOptionSelectionChange): void {
        this.userSelected = user.source.value;
    }

    copySettingsFromUser(): void {
        this._usersService
            .copySettingsFromUser(this.user?.id, this.userSelected?.id, this.selectedApplication?.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());

                this._usersService.getUserById(this.user?.id).pipe(untilDestroyed(this)).subscribe();
            });
    }

    resetApplicationUsersControl(auto: MatAutocomplete): void {
        setTimeout(_ => {
            auto.options.forEach(item => {
                item.deselect();
            });
            this.applicationUsersControl.reset('');
            this.userSelected = null;
        }, 100);
    }
}
