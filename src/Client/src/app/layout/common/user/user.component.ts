import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@UntilDestroy()
@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'user',
    standalone: true,
    imports: [
        MatButtonModule,
        MatMenuModule,
        NgIf,
        MatIconModule,
        NgClass,
        MatDividerModule,
        RouterLink,
        TranslocoModule,
    ],
})
export class UserComponent implements OnInit {
    static ngAcceptInputType_showAvatar: BooleanInput;

    @Input() showAvatar = true;
    user: User;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        // Subscribe to user changes
        this._userService.user$.pipe(untilDestroyed(this)).subscribe((user: User) => {
            this.user = user;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    // updateUserStatus(status: string): void
    // {
    //     // Return if user is not available
    //     if ( !this.user )
    //     {
    //         return;
    //     }

    //     // Update the user
    //     this._userService.update({
    //         ...this.user,
    //         status,
    //     }).subscribe();
    // }

    signOut(): void {
        this._router.navigate(['/sign-out']);
    }
}
