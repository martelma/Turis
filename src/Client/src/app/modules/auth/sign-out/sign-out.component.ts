import { I18nPluralPipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize, takeWhile, tap, timer } from 'rxjs';

@UntilDestroy()
@Component({
    selector: 'app-auth-sign-out',
    templateUrl: './sign-out.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf, RouterLink, I18nPluralPipe, TranslocoModule],
})
export class AuthSignOutComponent implements OnInit {
    countdown = 5;
    countdownMapping: any = {
        '=1': '# second',
        other: '# seconds',
    };

    constructor(
        private _authService: AuthService,
        private _router: Router,
    ) {}

    ngOnInit(): void {
        // Sign out
        this._authService.signOut();

        // Redirect after the countdown
        timer(1000, 1000)
            .pipe(
                finalize(() => {
                    this._router.navigate(['sign-in']);
                }),
                takeWhile(() => this.countdown > 0),
                tap(() => this.countdown--),
                untilDestroyed(this),
            )
            .subscribe();
    }
}
