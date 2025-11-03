import { Component, Inject, OnInit } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User } from 'app/models';
import { APPLICATION_CONFIGURATION_TOKEN } from 'app/configurations/application-configuration.token';
import { ApplicationConfiguration } from 'app/configurations/application-configuration.types';

@UntilDestroy()
@Component({
    selector: 'app-base',
    templateUrl: './base.component.html',
})
export class BaseComponent implements OnInit {
    public loading = false;
    public waiting = false;

    public isProductionMode: boolean;
    public isStagingMode: boolean;
    public isDevMode: boolean;
    public user: User;

    constructor(
        protected userService: UserService,
        @Inject(APPLICATION_CONFIGURATION_TOKEN) private _applicationConfig: ApplicationConfiguration,
    ) {}

    ngOnInit(): void {
        this.isProductionMode = this._applicationConfig.production;
        this.isStagingMode = this._applicationConfig.staging;
        this.isDevMode = this._applicationConfig.dev;

        // Subscribe to the user service
        this.userService.user$.pipe(untilDestroyed(this)).subscribe((user: User) => {
            this.user = user;
        });
    }

    getLocalStorageValue(key: string) {
        return localStorage.getItem(this.userKey(key));
    }

    setLocalStorageValue(key: string, value: string) {
        localStorage.setItem(this.userKey(key), value);
    }

    userKey(key: string) {
        if (this.isDevMode) {
            return `${this.user?.userName}-dev-${key}`;
        } else if (this.isStagingMode) {
            return `${this.user?.userName}-staging-${key}`;
        } else if (this.isProductionMode) {
            return `${this.user?.userName}-${key}`;
        } else {
            console.log('error');
        }
    }

    goToLink(relativeUrl: string, newTab = false) {
        if (newTab) {
            window.open(relativeUrl, '_blank');
        } else {
            window.open(relativeUrl, '_self');
        }
    }
}
