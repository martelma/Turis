import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from 'app/core/auth/auth.service';
import { MaterialModule } from 'app/modules/material.module';
import { User } from 'app/core/user/user.types';
import { Otp } from 'app/core/auth/auth.types';
import { Observable } from 'rxjs';
import { UserService } from 'app/core/user/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceSummaryComponent } from './service-summary/service-summary.component';
import { TeamSummaryComponent } from './team-summary/team-summary.component';

@UntilDestroy()
@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        TranslocoModule,
        ServiceSummaryComponent,
        TeamSummaryComponent,
    ],
})
export class DashboardComponent implements OnInit {
    public user: User;
    public isScreenSmall: boolean;

    constructor(
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _authService: AuthService,
        private _userService: UserService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }
    }

    ngOnInit(): void {
        this._loadUser();
    }

    private _loadUser(): void {
        this._userService.me().pipe(untilDestroyed(this)).subscribe();
    }

    private _getSiteOtp(): Observable<Otp> {
        return this._authService.generateOtp();
    }
}
