import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { debounceTime, map, tap } from 'rxjs';
import { UsersService } from '../users.service';
import { UsersListComponent } from '../list/list.component';
import { SafeUrl } from '@angular/platform-browser';
import { UserService } from 'app/core/user/user.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User } from 'app/core/user/user.types';
import { TranslocoModule } from '@ngneat/transloco';
import { getSuccessModal } from '../../../../shared/types/confirm-modal.types';
import { trackByFn } from '../../../../shared/utils';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { fuseAnimations } from '@fuse/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Application } from '../../applications/applications.types';

@UntilDestroy()
@Component({
    selector: 'users-details',
    styleUrls: ['./details.component.scss'],
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        RouterModule,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        TextFieldModule,
        DatePipe,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatRippleModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatSelectModule,
        MatOptionModule,
        MatDatepickerModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatPaginatorModule,
        TranslocoModule,
        FuseAlertComponent,
        FuseFindByKeyPipe,
    ],
})
export class UsersDetailsComponent implements OnInit {
    @Input() debounce = 300;

    form: UntypedFormGroup;
    newUser: any;
    avatarUrl: SafeUrl;

    user: User;
    isCreateUser = false;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    showAlert = false;
    resettingPassword = false;
    resettingDefaultPassword = false;

    trackByFn = trackByFn;

    // Applications
    userApplications: Application[];
    userApplicationsSearchInputControl: UntypedFormControl = new UntypedFormControl();
    userApplicationsPageIndex = 0;
    userApplicationsPageSize = 10;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _usersListComponent: UsersListComponent,
        private _usersService: UsersService,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router,
        private _authService: AuthService,
        protected userService: UserService,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }
    }

    ngOnInit(): void {
        // Create the user form
        this.createForm();

        // Open the drawer
        this._usersListComponent.matDrawer.open();

        this._subscribeActivatedRouteParams();

        this._subscribeUser();

        this._subscribeResettingPassword();

        this._subscribeResettingDefaultPassword();

        this._subscribeUserApplicationsFilter();
    }

    private _subscribeActivatedRouteParams(): void {
        this._activatedRoute.params
            .pipe(
                tap(params => {
                    // Activates the create user mode
                    this.isCreateUser = params.id === 'new';
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    private _subscribeUser(): void {
        // Get the user
        this._usersService.user$
            .pipe(
                tap((user: User) => {
                    this.setUser(user);
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    private _subscribeResettingPassword(): void {
        this._authService.resettingPassword$.pipe(untilDestroyed(this)).subscribe((resettingPassword: boolean) => {
            this.resettingPassword = resettingPassword;
        });
    }

    private _subscribeResettingDefaultPassword(): void {
        this._authService.resettingDefaultPassword$
            .pipe(untilDestroyed(this))
            .subscribe((resettingDefaultPassword: boolean) => {
                this.resettingDefaultPassword = resettingDefaultPassword;
            });
    }

    private _subscribeUserApplicationsFilter(): void {
        // Subscribe to the search field value changes
        this.userApplicationsSearchInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe(() => {
                this.filterUserApplications();
            });
    }

    private setUser(user: User): void {
        // Open the drawer in case it is closed
        this._usersListComponent.matDrawer.open();

        // Get the user
        this.user = user;

        // Sets the avatar
        this.avatarUrl = this.user.avatarUrl;

        // Patch values to the form
        this.form.patchValue(user);

        this._paginateUserApplications({
            pageIndex: this.userApplicationsPageIndex,
            pageSize: this.userApplicationsPageSize,
            length: this.user?.applications?.length ?? 0,
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    private createForm() {
        const u: User = {
            id: null,
            userName: '',
            email: '',
            firstName: '',
            lastName: '',
            fullName: '',
            isActive: false,
            accountType: null,
            applications: [],
        };
        this.form = this._formBuilder.group(u);
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._usersListComponent.matDrawer.close();
    }

    closeCreateUserDrawer(): Promise<MatDrawerToggleResult> {
        // Navigate to the contact list component
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });

        // Close the matDrawer
        return this._usersListComponent.matDrawer.close();
    }

    updateOrCreateUser(): void {
        const user = {
            email: this.form.get('email').value,
            firstName: this.form.get('firstName').value,
            isActive: this.form.get('isActive').value,
            lastName: this.form.get('lastName').value,
            roles: [],
            userId: this.form.get('id').value,
            userName: this.form.get('userName').value,
        };

        if (this.user) {
            this.user?.applications?.forEach(app => {
                if (app) {
                    app.roles.forEach(role => {
                        user.roles.push(role.id.toString());
                    });
                }
            });
        }

        if (this.isCreateUser) {
            this._usersService
                .createUser({
                    ...user,
                    isActive: true,
                })
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    this._fuseConfirmationService.open(getSuccessModal());

                    this.closeCreateUserDrawer();
                });
        } else {
            this._usersService
                .updateUser({ ...user, isActive: true })
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    this._fuseConfirmationService.open(getSuccessModal());
                    this._usersService.getUserById(user.userId.toString()).subscribe();

                    // Refreshes the list of users
                    this._usersService.getUsers().pipe(untilDestroyed(this)).subscribe();
                });
        }
    }

    deleteUser(): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete user',
            message: 'Are you sure you want to delete this user? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe(result => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Get the current user's id
                const userId = this.user.id;

                // Delete the user
                this._usersService
                    .deleteUser(userId)
                    .pipe(
                        tap(() => {
                            this._fuseConfirmationService.open(getSuccessModal());
                            this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                        }),
                        untilDestroyed(this),
                    )
                    .subscribe();
            }
        });
    }

    closeEditDrawer(): void {
        this._usersService
            .getUserById(this.user?.id)
            .pipe(
                tap(() => {
                    if (this.isCreateUser) this.closeCreateUserDrawer();
                    else this.closeDrawer();
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    newApplication(): void {
        this._router.navigate(['/applications/new']);
    }

    editApplication(applicationId: string): void {
        this._router.navigate([`/applications/${applicationId}`]);
    }

    onResetPassword(): void {
        this._authService
            .resetPasswordRequest({ email: this.user?.email })
            .pipe(
                tap(() => {
                    this.alert = { ...this.alert, message: 'The email has been successfully sent' };
                    this.showAlert = true;
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    onResetDefaultPassword(): void {
        this._authService
            .resetDefaultPassword({ userId: this.user?.id })
            .pipe(
                tap(() => {
                    this.alert = { ...this.alert, message: 'The password was successfully reset to default' };
                    this.showAlert = true;
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    handleUsersPageEvent(event: PageEvent): void {
        this.userApplicationsPageIndex = event.pageIndex;
        this.userApplicationsPageSize = event.pageSize;

        this._paginateUserApplications(event);
    }

    filterUserApplications(): void {
        // TODO: To be implemented
    }

    private _paginateUserApplications(event: PageEvent) {
        const startIndex = event.pageIndex * event.pageSize;
        let endIndex = startIndex + event.pageSize + 1;
        if (endIndex > this.user?.applications?.length) {
            endIndex = this.user?.applications?.length;
        }
        this.userApplications = this.user?.applications?.slice(startIndex, endIndex) ?? [];
    }
}
