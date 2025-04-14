import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import {
    Observable,
    of,
    switchMap,
    throwError,
    combineLatest,
    from,
    BehaviorSubject,
    finalize,
    catchError,
    take,
    map,
} from 'rxjs';
import { CreateUserRequest, User } from '../user/user.types';
import { Login, Otp, PartialLogin, ResetPasswordRequest, SecurityCode, isPartialLogin } from './auth.types';
import { ChangePasswordRequest } from 'app/modules/admin/users/users.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated = false;

    private _resettingPassword: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _resettingDefaultPassword: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
    ) {}

    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    set refreshToken(refreshToken: string) {
        localStorage.setItem('refreshToken', refreshToken);
    }

    get refreshToken(): string {
        return localStorage.getItem('refreshToken') ?? '';
    }

    set storageUser(user: User) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    get storageUser(): User {
        return localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : undefined;
    }

    /**
     * Getter for resetting password
     */
    get resettingPassword$(): Observable<boolean> {
        return this._resettingPassword.asObservable();
    }

    /**
     * Getter for resetting default password
     */
    get resettingDefaultPassword$(): Observable<boolean> {
        return this._resettingDefaultPassword.asObservable();
    }

    clearStorage(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    }

    registerUser(request: CreateUserRequest): Observable<any> {
        return this._httpClient.post(`${environment.baseUrl}/api/auth/register`, request);
    }

    resetPasswordRequest(info: { email: string }): Observable<any> {
        this._resettingPassword.next(true);
        return this._httpClient.post(`${environment.baseUrl}/api/auth/reset-password-request`, info).pipe(
            finalize(() => {
                this._resettingPassword.next(false);
            }),
        );
    }

    resetDefaultPassword(info: { userId: string }): Observable<any> {
        this._resettingDefaultPassword.next(true);
        return this._httpClient.post(`${environment.baseUrl}/api/auth/reset-default-password`, info).pipe(
            finalize(() => {
                this._resettingDefaultPassword.next(false);
            }),
        );
    }

    resetPassword(password: ResetPasswordRequest): Observable<any> {
        return this._httpClient.post(`${environment.baseUrl}/api/auth/reset-password`, password);
    }

    changePassword(request: ChangePasswordRequest) {
        return this._httpClient.post(`${environment.baseUrl}/api/auth/change-password`, request);
    }

    signIn(credentials: { usernameEmail: string; password: string }): Observable<Login | PartialLogin> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError(() => 'User is already logged in.');
        }

        return this._httpClient
            .post(`${environment.baseUrl}/api/auth/login`, {
                password: credentials.password,
                userName: credentials.usernameEmail,
            })
            .pipe(
                switchMap((response: Login | PartialLogin) => {
                    if (isPartialLogin(response)) {
                        return of(response);
                    }

                    const login = response as Login;

                    // Store the access token in the local storage
                    this.accessToken = login.accessToken;
                    this.refreshToken = login.refreshToken;

                    return combineLatest([from(this._userService.me()), of(response)]);
                }),
                switchMap((response: PartialLogin | [User, Login]) => {
                    if (isPartialLogin(response)) {
                        return of(response);
                    }

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    const [me, resp] = response;

                    const user: User = me as User;
                    // Store the user on the user service

                    this._userService.user = user;
                    this.storageUser = user;

                    // Return a new observable with the response
                    return of(resp);
                }),
            );
    }

    signOut(): Observable<any> {
        localStorage.clear();

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
        return this._httpClient.post(`${environment.baseUrl}/api/auth/sign-up`, user);
    }

    static redirectToHomepage(): void {
        window.open('/home', '_self');
    }

    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this._httpClient.get(`${environment.baseUrl}/api/auth/check`).pipe(
            take(1),
            switchMap(() => {
                return this._userService.me().pipe(
                    take(1),
                    switchMap((user: User) => {
                        this._authenticated = true;

                        this._userService.user = user;

                        return this.createSecurityCode().pipe(
                            take(1),
                            map((securityCode: SecurityCode) => {
                                // Sets the security code in the local storage
                                localStorage.setItem('securityCode', securityCode.code);

                                return true;
                            }),
                        );
                    }),
                );
            }),
        );
    }

    createSecurityCode(): Observable<SecurityCode> {
        return this._httpClient.post<SecurityCode>(`${environment.baseUrl}/api/auth/security-code`, null);
    }

    generateOtp(): Observable<Otp> {
        return this._httpClient.get(`${environment.baseUrl}/api/auth/otp`);
    }

    refreshAccessToken(): Observable<any> {
        // Call the refresh token endpoint to get a new access token
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        return this._httpClient
            .post(`${environment.baseUrl}/api/auth/refresh-token`, { accessToken, refreshToken })
            .pipe(
                take(1),
                switchMap((response: Login | PartialLogin) => {
                    if (isPartialLogin(response)) {
                        return of(response);
                    }

                    const login = response as Login;

                    // Store the access token in the local storage
                    this.accessToken = login.accessToken;
                    this.refreshToken = login.refreshToken;

                    return combineLatest([from(this._userService.me()), of(response)]);
                }),
                switchMap((response: PartialLogin | [User, Login]) => {
                    if (isPartialLogin(response)) {
                        return of(response);
                    }

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    const [me, resp] = response;

                    const user: User = me as User;
                    // Store the user on the user service

                    this._userService.user = user;
                    this.storageUser = user;

                    // Return a new observable with the response
                    return this.createSecurityCode().pipe(
                        take(1),
                        map((securityCode: SecurityCode) => {
                            // Sets the security code in the local storage
                            localStorage.setItem('securityCode', securityCode.code);

                            // Security Code freshly generated
                            return resp;
                        }),
                    );
                }),
                catchError(error => {
                    // Handle refresh token error (e.g., redirect to login page)
                    console.error('Error refreshing access token:', error);
                    return throwError(error);
                }),
            );
    }

    remainingLoginAttempts(userName: string): Observable<number> {
        return this._httpClient.get<number>(
            `${environment.baseUrl}/api/auth/remaining-login-attempts?userName=${userName}`,
        );
    }

    requestUnlock(userName: string): Observable<void> {
        return this._httpClient.post<void>(`${environment.baseUrl}/api/auth/request-unlock`, {
            userName,
        });
    }

    unlockUser(userName: string): Observable<void> {
        return this._httpClient.post<void>(`${environment.baseUrl}/api/auth/unlock`, {
            userName,
        });
    }
}
