import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ApplicationsService } from '../applications.service';
import { debounceTime, map, tap } from 'rxjs';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@ngneat/transloco';
import { ApplicationsListComponent } from '../list/list.component';
import { getSuccessModal } from 'app/shared/types/confirm-modal.types';
import { Application, ApplicationRole, ApplicationScope, ApplicationScopeGroup } from '../applications.types';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { User } from 'app/core/user/user.types';
import { isUserOwner } from 'app/core/user/user.utils';
import { UserService } from 'app/core/user/user.service';
import { MatMenuModule } from '@angular/material/menu';

@UntilDestroy()
@Component({
    selector: 'app-application-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatButtonModule,
        RouterLink,
        MatIconModule,
        NgIf,
        NgFor,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatTabsModule,
        MatPaginatorModule,
        MatMenuModule,
        TranslocoModule,
    ],
})
export class ApplicationsDetailsComponent implements OnInit {
    @Input() debounce = 300;

    application: Application;
    form: UntypedFormGroup;

    isCreate = false;

    // Users
    applicationUsers: User[];
    usersSearchInputControl: UntypedFormControl = new UntypedFormControl();
    usersPageIndex = 0;
    usersPageSize = 10;

    // Roles
    applicationRoles: ApplicationRole[];
    rolesSearchInputControl: UntypedFormControl = new UntypedFormControl();
    rolesPageIndex = 0;
    rolesPageSize = 10;

    // Scopes
    applicationScopes: ApplicationScope[];
    scopesSearchInputControl: UntypedFormControl = new UntypedFormControl();
    scopesPageIndex = 0;
    scopesPageSize = 10;

    // Scope Groups
    applicationScopeGroups: ApplicationScopeGroup[];
    scopeGroupsSearchInputControl: UntypedFormControl = new UntypedFormControl();
    scopeGroupsPageIndex = 0;
    scopeGroupsPageSize = 10;

    user: User;
    isUserOwner = false;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _applicationsListComponent: ApplicationsListComponent,
        private _applicationsService: ApplicationsService,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _userService: UserService,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }
    }

    ngOnInit(): void {
        // Create the form
        this._createForm();

        // Open the drawer
        this._applicationsListComponent.matDrawer.open();

        this._subscribeUser();

        this._subscribeActivatedRouteParams();

        this._subscribeApplication();

        this._subscribeUserFilter();

        this._subscribeRoleFilter();

        this._subscribeScopeFilter();

        this._subscribeScopeGroupFilter();
    }

    private _subscribeUser(): void {
        this._userService.user$.pipe(untilDestroyed(this)).subscribe((user: User) => {
            this.user = user;

            this.isUserOwner = isUserOwner(this.user);

            this._changeDetectorRef.markForCheck();
        });
    }

    private _subscribeActivatedRouteParams(): void {
        this._activatedRoute.params
            .pipe(
                tap(params => {
                    // Activates the create user mode
                    this.isCreate = params.id === 'new';
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    private _subscribeApplication(): void {
        // Get the application
        this._applicationsService.application$.pipe(untilDestroyed(this)).subscribe((application: Application) => {
            // Open the drawer in case it is closed
            this._applicationsListComponent.matDrawer.open();

            // Get the application
            this.application = application;

            this._paginateUsers({
                pageIndex: this.usersPageIndex,
                pageSize: this.usersPageSize,
                length: this.application?.users?.length ?? 0,
            });

            this._paginateRoles({
                pageIndex: this.rolesPageIndex,
                pageSize: this.rolesPageSize,
                length: this.application?.roles?.length ?? 0,
            });

            this._paginateScopes({
                pageIndex: this.scopesPageIndex,
                pageSize: this.scopesPageSize,
                length: this.application?.scopes?.length ?? 0,
            });

            this._paginateScopeGroups({
                pageIndex: this.scopeGroupsPageIndex,
                pageSize: this.scopeGroupsPageSize,
                length: this.application?.scopeGroups?.length ?? 0,
            });

            // Fill the form
            this.form.patchValue(application);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    private _subscribeUserFilter(): void {
        // Subscribe to the search field value changes
        this.usersSearchInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe(() => {
                this.filterUsers();
            });
    }

    private _subscribeRoleFilter(): void {
        // Subscribe to the search field value changes
        this.rolesSearchInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe(() => {
                this.filterRoles();
            });
    }

    private _subscribeScopeFilter(): void {
        // Subscribe to the search field value changes
        this.scopesSearchInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe(() => {
                this.filterScopes();
            });
    }

    private _subscribeScopeGroupFilter(): void {
        // Subscribe to the search field value changes
        this.scopeGroupsSearchInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe(() => {
                this.filterScopeGroups();
            });
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._applicationsListComponent.matDrawer.close();
    }

    updateOrCreateApplication(): void {
        const application: Application = { ...this.form.value };

        this._applicationsService
            .saveApplication(application, this.isCreate)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());

                // Trigger update on the home page or refresh the list
                this._applicationsService.getApplicationById(application.id).subscribe();

                // Close the drawer or navigate away if in create mode
                if (this.isCreate) {
                    this.closeCreateApplicationDrawer();
                } else {
                    // Optionally, re-fetch the updated application data
                    this._applicationsService.getApplicationById(application.id).subscribe();
                }
            });
    }

    deleteApplication(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Application',
            message: 'Are you sure you want to remove this application? This action cannot be undone!',
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
                    // Get the application object
                    const application = this.form.getRawValue();

                    // Delete the application on the server
                    this._applicationsService.deleteApplication(application.id).subscribe(() => {
                        this._fuseConfirmationService.open(getSuccessModal());

                        // Close the details
                        this.closeDetails();

                        this._applicationsService.getApplicationById(application.id).subscribe();
                    });
                }
            });
    }

    closeCreateApplicationDrawer(): Promise<MatDrawerToggleResult> {
        // Navigate to the application list component
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });

        // Close the matDrawer
        return this._applicationsListComponent.matDrawer.close();
    }

    closeDetails(): void {
        this.application = null;

        this._applicationsListComponent.matDrawer.close().then(() => {
            this._router.navigate(['../']);
        });
    }

    private _createForm() {
        const application: Application = {
            id: null,
            name: '',
            description: '',
            url: '',
            icon: '',
        };
        this.form = this._formBuilder.group(application);
    }

    private _openUserPage(contactId: string): void {
        this._router.navigate([`/users/${contactId}`]);
    }

    private _openRolePage(applicationId: string, roleId?: string): void {
        if (roleId) {
            this._router.navigate([`/applications/${applicationId}/roles/${roleId}`]);
        } else {
            this._router.navigate([`/applications/${applicationId}/roles`]);
        }
    }

    private _openScopePage(applicationId: string, scopeId?: string): void {
        if (scopeId) {
            this._router.navigate([`/applications/${applicationId}/scopes/${scopeId}`]);
        } else {
            this._router.navigate([`/applications/${applicationId}/scopes`]);
        }
    }

    private _openScopeGroupPage(applicationId: string, scopeGroupId?: string): void {
        if (scopeGroupId) {
            this._router.navigate([`/applications/${applicationId}/scope-groups/${scopeGroupId}`]);
        } else {
            this._router.navigate([`/applications/${applicationId}/scope-groups`]);
        }
    }

    newContact(): void {
        this._applicationsListComponent.selectedApplication = this.application;
        this._openUserPage('new');
    }

    openRoles(roleId?: string): void {
        this._openRolePage(this.application.id, roleId);
    }

    newRole(): void {
        this._applicationsListComponent.selectedApplication = this.application;
        this._openRolePage(this.application.id, 'new');
    }

    openScopes(scopeId?: string): void {
        this._applicationsListComponent.selectedApplication = this.application;
        this._openScopePage(this.application.id, scopeId);
    }

    newScope(): void {
        this._applicationsListComponent.selectedApplication = this.application;
        this._openScopePage(this.application.id, 'new');
    }

    newScopeGroup(): void {
        this._applicationsListComponent.selectedApplication = this.application;
        this._openScopeGroupPage(this.application.id, 'new');
    }

    openScopeGroups(scopeGroupId?: string): void {
        this._applicationsListComponent.selectedApplication = this.application;
        this._openScopeGroupPage(this.application.id, scopeGroupId);
    }

    newUser(): void {
        this._router.navigate(['/users/new']);
    }

    editUser(userId: string): void {
        this._router.navigate([`/users/${userId}`]);
    }

    handleUsersPageEvent(event: PageEvent): void {
        this.usersPageIndex = event.pageIndex;
        this.usersPageSize = event.pageSize;

        this._paginateUsers(event);
    }

    filterUsers(): void {
        // TODO: To be implemented
    }

    private _paginateUsers(event: PageEvent) {
        const startIndex = event.pageIndex * event.pageSize;
        let endIndex = startIndex + event.pageSize + 1;
        if (endIndex > this.application?.users?.length) {
            endIndex = this.application?.users?.length;
        }
        this.applicationUsers = this.application?.users?.slice(startIndex, endIndex) ?? [];
    }

    handleRolesPageEvent(event: PageEvent): void {
        this.rolesPageIndex = event.pageIndex;
        this.rolesPageSize = event.pageSize;

        this._paginateRoles(event);
    }

    filterRoles(): void {
        // TODO: To be implemented
    }

    private _paginateRoles(event: PageEvent) {
        const startIndex = event.pageIndex * event.pageSize;
        let endIndex = startIndex + event.pageSize + 1;
        if (endIndex > this.application?.roles?.length) {
            endIndex = this.application?.roles?.length;
        }
        this.applicationRoles = this.application?.roles?.slice(startIndex, endIndex) ?? [];
    }

    handleScopesPageEvent(event: PageEvent): void {
        this.scopesPageIndex = event.pageIndex;
        this.scopesPageSize = event.pageSize;

        this._paginateScopes(event);
    }

    filterScopes(): void {
        // TODO: To be implemented
    }

    private _paginateScopes(event: PageEvent) {
        const startIndex = event.pageIndex * event.pageSize;
        let endIndex = startIndex + event.pageSize + 1;
        if (endIndex > this.application?.scopes?.length) {
            endIndex = this.application?.scopes?.length;
        }
        this.applicationScopes = this.application?.scopes?.slice(startIndex, endIndex) ?? [];
    }

    handleScopeGroupsPageEvent(event: PageEvent): void {
        this.scopeGroupsPageIndex = event.pageIndex;
        this.scopeGroupsPageSize = event.pageSize;

        this._paginateScopeGroups(event);
    }

    filterScopeGroups(): void {
        // TODO: To be implemented
    }

    private _paginateScopeGroups(event: PageEvent) {
        const startIndex = event.pageIndex * event.pageSize;
        let endIndex = startIndex + event.pageSize + 1;
        if (endIndex > this.application?.scopeGroups?.length) {
            endIndex = this.application?.scopeGroups?.length;
        }
        this.applicationScopeGroups = this.application?.scopeGroups?.slice(startIndex, endIndex) ?? [];
    }
}
