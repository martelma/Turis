import { TextFieldModule } from '@angular/cdk/text-field';
import { JsonPipe, NgIf } from '@angular/common';
import { Component, ViewEncapsulation, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@jsverse/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User } from 'app/core/user/user.types';
import { UsersService } from '../users.service';
import { getSuccessModal } from 'app/shared/types/confirm-modal.types';
import { AuthService } from 'app/core/auth/auth.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@UntilDestroy()
@Component({
    selector: 'app-users-form',
    templateUrl: './form.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        RouterModule,
        ReactiveFormsModule,
        TextFieldModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatPaginatorModule,
        MatCheckboxModule,
        TranslocoModule,
        FuseAlertComponent,
        JsonPipe,
    ],
})
export class UsersFormComponent implements OnInit {
    @Input() debounce = 300;
    @Input() isCreate = false;

    @Output() userAdded = new EventEmitter<void>();
    @Output() userUpdated = new EventEmitter<void>();
    @Output() userDeleted = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    form: UntypedFormGroup;
    newUser: any;
    avatarUrl: SafeUrl;

    user: User;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    showAlert = false;
    resettingPassword = false;
    resettingDefaultPassword = false;
    unlockingUser = false;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _usersService: UsersService,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _authService: AuthService,
        private _router: Router,
    ) {}

    ngOnInit(): void {
        this._createForm();

        this._subscribeUser();

        this._subscribeResettingPassword();

        this._subscribeResettingDefaultPassword();
    }

    private _createForm(): void {
        const u: User = {
            id: null,
            userName: '',
            email: '',
            firstName: '',
            lastName: '',
            fullName: '',
            avatar: '',
            avatarUrl: '',
            language: '',
            isActive: false,
            twoFactorEnabled: false,
            applicationId: null,
            applicationName: null,
            applicationRoles: [],
            accountType: null,
            applications: [],
            roles: [],
            scopes: [],
        };
        this.form = this._formBuilder.group(u);
    }

    private _subscribeUser(): void {
        // Get the user
        this._usersService.user$.pipe(untilDestroyed(this)).subscribe((user: User) => {
            this.setUser(user);
        });
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

    private setUser(user: User): void {
        // Get the user
        this.user = user;

        // Sets the avatar
        this.avatarUrl = this.user.avatarUrl;

        // Patch values to the form
        this.form.patchValue(user);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    onResetPassword(): void {
        this._authService
            .resetPasswordRequest({ email: this.user?.email })
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this.alert = { ...this.alert, message: 'The email has been successfully sent' };
                this.showAlert = true;
            });
    }

    onResetDefaultPassword(): void {
        this._authService
            .resetDefaultPassword({ userId: this.user?.id })
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this.alert = { ...this.alert, message: 'The password was successfully reset to default' };
                this.showAlert = true;
            });
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
            twoFactorEnabled: this.form.get('twoFactorEnabled').value,
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

        if (this.isCreate) {
            this._usersService
                .createUser({
                    ...user,
                    isActive: true,
                })
                .pipe(untilDestroyed(this))
                .subscribe(() => {
                    this._fuseConfirmationService.open(getSuccessModal());

                    this.userAdded.emit();
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

                    this.userUpdated.emit();
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
                    .pipe(untilDestroyed(this))
                    .subscribe(() => {
                        this._fuseConfirmationService.open(getSuccessModal());
                        this._router.navigate(['../'], { relativeTo: this._activatedRoute });

                        this.userDeleted.emit();
                    });
            }
        });
    }

    cancelEdit(): void {
        this.cancel.emit();
    }

    unlockUser(): void {
        this.unlockingUser = true;

        this._authService
            .unlockUser(this.user.userName)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());

                this.unlockingUser = false;
            });
    }
}
