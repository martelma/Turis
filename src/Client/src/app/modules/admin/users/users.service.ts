import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'environments/environment';
import { CreateUserRequest, UpdateUserRequest, User } from 'app/core/user/user.types';
import { BaseEntityService } from 'app/shared/services';
import { XApplicationIdHeader } from '../admin.types';
import { BaseSearchParameters, PaginatedList } from 'app/shared/types/shared.types';
import { AuthService } from 'app/core/auth/auth.service';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class UsersService extends BaseEntityService<User> {
    private _user: BehaviorSubject<User> = new BehaviorSubject(null);
    private _users: BehaviorSubject<PaginatedList<User>> = new BehaviorSubject({
        items: [],
        pageIndex: 0,
        pageSize: 10,
        totalCount: 0,
        hasNextPage: false,
    });

    constructor(
        protected httpClient: HttpClient,
        private _authService: AuthService,
        private _sanitizer: DomSanitizer,
    ) {
        super(httpClient);
        this.defaultApiController = 'users';
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    get users$(): Observable<PaginatedList<User>> {
        return this._users.asObservable();
    }

    get users(): PaginatedList<User> {
        return this._users.getValue();
    }

    getUsers(params?: BaseSearchParameters): Observable<PaginatedList<User>> {
        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');

        return this.list(httpParams, null, XApplicationIdHeader).pipe(
            map((list: PaginatedList<User>) => {
                list = {
                    ...list,
                    items: list.items.map(user => ({
                        ...user,
                        avatarUrl: user.avatar
                            ? this._sanitizer.bypassSecurityTrustResourceUrl(`data:image/jpg;base64, ${user.avatar}`)
                            : undefined,
                    })),
                };

                this._users.next(list);

                return list;
            }),
        );
    }

    getUserById(id: string): Observable<User> {
        if (!id) {
            this._user.next(null);
            return of(null);
        }

        if (id === 'new') {
            const user = {
                id: '',
                userName: '',
                firstName: '',
                lastName: '',
                fullName: '',
                email: '',
                roles: [],
                applications: [],
            };

            this._user.next(user);
            return of(user);
        }

        return this.getSingle(id, null, XApplicationIdHeader).pipe(
            map((user: User) => {
                user = {
                    ...user,
                    avatarUrl: user.avatar
                        ? this._sanitizer.bypassSecurityTrustResourceUrl(`data:image/jpg;base64, ${user.avatar}`)
                        : undefined,
                };

                this._user.next(user);
                return user;
            }),
        );
    }

    createUser(request: CreateUserRequest): Observable<User> {
        return this._authService.registerUser(request).pipe(
            map(user => {
                this._user.next(user);

                this._users.next({
                    ...this.users,
                    items: [...this.users.items, user],
                });

                return user;
            }),
        );
    }

    updateUser(request: UpdateUserRequest): Observable<User> {
        return this.update(request, null, XApplicationIdHeader).pipe(
            map(user => {
                this._user.next(user);

                this._users.next({
                    ...this.users,
                    items: this.users.items.map(u => (u.id === user.id ? user : u)),
                });

                return user;
            }),
        );
    }

    deleteUser(userId: string): Observable<void> {
        return this.http
            .delete<User>(this.prepareUrl(userId), {
                headers: XApplicationIdHeader,
            })
            .pipe(
                map(() => {
                    this._user.next(null);

                    this._users.next({
                        ...this.users,
                        items: this.users.items.filter(item => item.id !== userId),
                    });
                }),
            );
    }

    saveAvatar(formData: FormData, userId: string): Observable<ArrayBuffer> {
        return this.httpClient.post<ArrayBuffer>(`${environment.baseUrl}/api/users/${userId}/avatar/`, formData);
    }

    resetAvatar(userId: string): Observable<void> {
        if (!userId) {
            return of(null);
        }

        return this.httpClient.delete<void>(`${environment.baseUrl}/api/users/${userId}/avatar`, {});
    }

    getAvatar(userId: string): Observable<any> {
        if (!userId) {
            return of(null);
        }

        return this.httpClient
            .get(`${environment.baseUrl}/api/users/${userId}/avatar/`, {
                observe: 'response',
                responseType: 'arraybuffer',
            })
            .pipe(
                map((response: HttpResponse<ArrayBuffer>) => {
                    return response.body;
                }),
                catchError(() => {
                    return of(false);
                }),
            );
    }

    copySettingsFromUser(userTargetId: string, userSourceId: string, applicationId: string) {
        return this.httpClient.post(`${environment.baseUrl}/api/users/copy-settings`, {
            applicationId,
            userSourceId,
            userTargetId,
        });
    }

    updateUserLanguage(userId: string, language: string) {
        return this.httpClient.put(`${environment.baseUrl}/api/users/${userId}/language`, {
            language,
        });
    }
}
