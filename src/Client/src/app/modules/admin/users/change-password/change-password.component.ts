import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FuseValidators } from '@fuse/validators';
import { TranslocoModule } from '@jsverse/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, of, tap } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { A11yModule } from '@angular/cdk/a11y';

@UntilDestroy()
@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgClass,
        NgIf,
        NgFor,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
        TranslocoModule,
        A11yModule,
    ],
})
export class ChangePasswordComponent implements OnInit {
    form: UntypedFormGroup;

    constructor(
        public matDialogRef: MatDialogRef<ChangePasswordComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _authService: AuthService,
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
        this._buildForm();
    }

    private _buildForm(): void {
        // Prepare the form
        this.form = this._formBuilder.group(
            {
                oldPassword: ['', Validators.required],
                newPassword: ['', Validators.required],
                passwordConfirmation: ['', Validators.required],
            },
            {
                validators: FuseValidators.mustMatch('newPassword', 'passwordConfirmation'),
            },
        );
    }

    onSubmit(): void {
        this._authService
            .changePassword({
                ...this.form.value,
            })
            .pipe(
                tap(() => {
                    this.matDialogRef.close(true);
                }),
                catchError(error => {
                    console.error(error);

                    this.snackBar.open(error.message, 'Dismiss', { panelClass: ['error'] });

                    return of(error);
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }
}
