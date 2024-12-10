import { Injectable } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
    public isProductionMode: boolean;
    public isStagingMode: boolean;
    public isDevMode: boolean;

    _user: User;

    constructor(private _userService: UserService) {
        this._user = this._userService.user;

        this.isProductionMode = environment.production;
        this.isStagingMode = environment.staging;
        this.isDevMode = environment.dev;
    }

    public setItem(key: string, data: any): void {
        localStorage.setItem(this.userKey(key), data);
    }

    public getItem(key: string): any {
        return JSON.parse(localStorage.getItem(this.userKey(key)));
    }

    public removeItem(key: string): void {
        localStorage.removeItem(this.userKey(key));
    }

    public clear() {
        localStorage.clear();
    }

    userKey(key: string): any {
        if (this.isDevMode) {
            return `${this._user?.userName}-dev-${key}`;
        } else if (this.isStagingMode) {
            return `${this._user?.userName}-staging-${key}`;
        } else if (this.isProductionMode) {
            return `${this._user?.userName}-${key}`;
        }

        console.log('error');
    }
}
