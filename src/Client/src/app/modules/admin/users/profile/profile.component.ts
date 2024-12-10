import { TextFieldModule } from '@angular/cdk/text-field';
import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseCardComponent } from '@fuse/components/card';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule } from '@ngneat/transloco';
import { ImageCropperComponent } from 'app/shared/components/image-cropper/image-cropper.component';
import { Observable, tap } from 'rxjs';
import { SafeUrl } from '@angular/platform-browser';
import { UsersService } from '../users.service';
import { dataURItoBlob } from 'app/shared';
import { getSuccessModal } from 'app/shared/types/confirm-modal.types';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@UntilDestroy()
@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        RouterLink,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        MatDividerModule,
        MatTooltipModule,
        MatSnackBarModule,
        FuseCardComponent,
        TextFieldModule,
        TranslocoModule,
    ],
})
export class ProfileComponent implements OnInit {
    user: User;
    avatarUrl: SafeUrl;
    userAvatar: any;

    constructor(
        private _userService: UserService,
        private _matDialog: MatDialog,
        private _usersService: UsersService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        public snackBar: MatSnackBar,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }
    }

    ngOnInit(): void {
        this._subscribeUser();
    }

    private _subscribeUser(): void {
        // Get the user
        this._userService.user$.pipe(untilDestroyed(this)).subscribe((user: User) => {
            this.user = user;

            this.avatarUrl = this.user.avatarUrl;

            this._changeDetectorRef.markForCheck();
        });
    }

    changePassword(): void {
        // Launch the modal
        this._matDialog
            .open(ChangePasswordComponent, {
                autoFocus: false,
            })
            .afterClosed()
            .pipe(untilDestroyed(this))
            .subscribe(result => {
                if (result) {
                    this.snackBar.open('The user password was successfully updated', 'Dismiss', {
                        panelClass: ['success'],
                    });
                }
            });
    }

    onFileChange(event: any) {
        const files = event.target.files as FileList;

        if (files.length > 0) {
            const _fileName = files[0].name;
            const _file = URL.createObjectURL(files[0]);
            this.openAvatarEditor(_file)
                .pipe(
                    tap(result => {
                        // No avatar selected
                        if (!result) {
                            return;
                        }

                        this.userAvatar = {
                            file: result,
                            fileName: _fileName,
                        };
                        this.avatarUrl = result;

                        this.saveAvatar();
                    }),
                    untilDestroyed(this),
                )
                .subscribe();
        }
    }

    openAvatarEditor(image: string): Observable<string> {
        const dialogRef = this._matDialog.open(ImageCropperComponent, {
            maxWidth: '80vw',
            maxHeight: '80vh',
            data: image,
        });

        return dialogRef.afterClosed();
    }

    saveAvatar = (): void => {
        if (!this.userAvatar) return;

        const formData = new FormData();
        formData.append('file', dataURItoBlob(this.userAvatar?.file), this.userAvatar?.fileName);

        this._usersService
            .saveAvatar(formData, this.user?.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());

                this._userService.me().pipe(untilDestroyed(this)).subscribe();
            });
    };

    removePreviewAvatar(): void {
        this.avatarUrl = null;
        this.userAvatar = null;
    }

    removeAvatar(): void {
        this._usersService
            .resetAvatar(this.user?.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this._fuseConfirmationService.open(getSuccessModal());

                this._userService.me().pipe(untilDestroyed(this)).subscribe();
            });
    }
}
