import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, map, lastValueFrom } from 'rxjs';
import { User } from './user.types';
import { HttpClient } from '@angular/common/http';
import { BaseEntityService } from 'app/shared/services';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseEntityService<User> {
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    set user(value: User) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    constructor(
        protected httpClient: HttpClient,
        private _sanitizer: DomSanitizer,
    ) {
        super(httpClient);
        this.defaultApiController = 'me';
    }

    public me(): Observable<User> {
        return this.apiGet<User>('', this.defaultApiController).pipe(
            map((user: User) => {
                this._user.next({
                    ...user,
                    avatarUrl: user.avatar
                        ? this._sanitizer.bypassSecurityTrustResourceUrl(`data:image/jpg;base64, ${user.avatar}`)
                        : undefined,
                });

                return user;
            }),
        );
    }
}
