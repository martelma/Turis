import { JsonPipe, NgClass, NgIf } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    isDevMode,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { TranslocoModule } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { switchMap, catchError, of, tap, map } from 'rxjs';
import { emailOrUsernameValidator } from './sign-in.validators';
import { Login, Otp, PartialLogin, isPartialLogin } from 'app/core/auth/auth.types';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { A11yModule } from '@angular/cdk/a11y';
import { environment } from 'environments/environment';
import { HttpStatusCode } from '@angular/common/http';

@UntilDestroy()
@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        RouterLink,
        NgIf,
        NgClass,
        JsonPipe,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        TranslocoModule,
        A11yModule,
    ],
})
export class SignInComponent implements OnInit {
    @ViewChild('passwordField') passwordFieldInput: ElementRef;
    @ViewChild('passwordConfirmationField') passwordConfirmationField: ElementRef;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    showAlert = false;
    signInForm: UntypedFormGroup;
    loginFailed = false;
    remainingLoginAttempts = 5;

    // Partial Login
    partialLogin: PartialLogin;
    resetPasswordForm: UntypedFormGroup;

    showRequestUnlock = false;
    errors = [];

    public isSignInLoading = false;
    private _redirectURL = '';

    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
        this._route.queryParams.subscribe(params => {
            this._redirectURL = params['redirectURL'];
        });
    }

    ngOnInit(): void {
        // Create the login form
        if (!environment.production) {
            this.signInForm = this._formBuilder.group({
                usernameEmail: ['mario', [Validators.required, emailOrUsernameValidator(/[a-zA-Z0-9]{3,}/)]],
                password: ['Abcd.1234', Validators.required],
            });
        } else {
            this.signInForm = this._formBuilder.group({
                usernameEmail: ['', [Validators.required, emailOrUsernameValidator(/[a-zA-Z0-9]{3,}/)]],
                password: ['', Validators.required],
            });
        }

        // Create the partial login form
        this.resetPasswordForm = this._formBuilder.group({
            password: ['', Validators.required],
            passwordConfirmation: ['', Validators.required],
        });
    }

    signIn(): void {
        this.loginFailed = false;
        this.isSignInLoading = true;
        this.signInForm.disable();

        this._authService
            .signIn(this.signInForm.value)
            .pipe(
                switchMap((response: PartialLogin | Login) => {
                    if (isPartialLogin(response)) {
                        this.partialLogin = response;
                        return of(null);
                    }

                    if (this._redirectURL?.trim().length > 0) {
                        return this._authService.generateOtp();
                    }
                    return of(null);
                }),
                tap((otpResponse: Otp) => {
                    // If the user has to be redirected
                    if (otpResponse != null) {
                        window.location.replace(`${this._redirectURL}?otp=${otpResponse.token}`);
                    } else {
                        if (this.partialLogin == null) {
                            // Otherwise redirects to workspace home
                            this._router.navigate(['/home']);
                        }
                    }
                }),
                catchError(error => {
                    this.loginFailed = true;

                    // Set focus on password input
                    this.signInForm.enable();
                    this.passwordFieldInput.nativeElement.focus();
                    this._changeDetectorRef.detectChanges();

                    // return of(false);

                    // Shows eventual errors from backend
                    this.showAlert = true;
                    this.alert = {
                        ...this.alert,
                        type: 'error',
                        message: error.error.title,
                    };

                    this.showRequestUnlock = error.status === HttpStatusCode.Forbidden;

                    // Updates the number of login attempts
                    return this._authService.remainingLoginAttempts(this.signInForm.get('usernameEmail').value).pipe(
                        tap(remainingLoginAttempts => {
                            this.remainingLoginAttempts = remainingLoginAttempts;

                            this._changeDetectorRef.detectChanges();
                        }),
                        map(() => of({ token: null })),
                        untilDestroyed(this),
                    );
                }),
                untilDestroyed(this),
            )
            .subscribe()
            .add(() => {
                this.signInForm.enable();
                this.isSignInLoading = false;
            });
    }

    resetPassword(): void {
        this.signInForm.disable();

        this._authService
            .resetPassword({
                ...this.resetPasswordForm.value,
                userId: this.partialLogin.userId,
                token: this.partialLogin.changePasswordToken,
            })
            .pipe(
                tap(() => {
                    this.partialLogin = null;
                    this.showAlert = false;
                    this.alert = {
                        ...this.alert,
                        message:
                            'The default password has been reset. You can proceed with the login process using your newly reset password',
                    };
                }),
                catchError(() => {
                    this.loginFailed = true;

                    // Set focus on password confirmation input
                    this.signInForm.disable();
                    this.passwordConfirmationField.nativeElement.focus();
                    this._changeDetectorRef.detectChanges();

                    return of(false);
                }),
                untilDestroyed(this),
            )
            .subscribe()
            .add(() => {
                this.signInForm.enable();
            });
    }
}
