import { NgFor, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AvailableLangs, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { UsersService } from 'app/modules/admin/users/users.service';
import { trackByFn } from 'app/shared';

@UntilDestroy()
@Component({
    selector: 'languages',
    templateUrl: './languages.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'languages',
    standalone: true,
    imports: [MatButtonModule, MatMenuModule, NgTemplateOutlet, NgFor],
})
export class LanguagesComponent implements OnInit {
    availableLangs: AvailableLangs;
    activeLang: string;
    flagCodes: any = {};

    user: User;

    trackByFn = trackByFn;

    constructor(
        private _translocoService: TranslocoService,
        private _userService: UserService,
        private _usersService: UsersService,
    ) {}

    ngOnInit(): void {
        // Get the available languages from transloco
        this.availableLangs = this._translocoService.getAvailableLangs();

        // Subscribe to language changes
        this._translocoService.langChanges$.subscribe(activeLang => {
            // Get the active lang
            this.activeLang = activeLang;
        });

        // Set the country iso codes for languages for flags
        this.availableLangs.forEach(l => {
            this.flagCodes[l.id] = l.id;
        });

        this._subscribeUser();
    }

    private _subscribeUser(): void {
        this._userService.user$.pipe(untilDestroyed(this)).subscribe((user: User) => {
            this.user = user;

            this._translocoService.setActiveLang(this.user.language ?? this._translocoService.getDefaultLang());
        });
    }

    setActiveLang(lang: string): void {
        // Set the active lang in the ui
        this._translocoService.setActiveLang(lang);

        // Persists the changes in db
        this._usersService.updateUserLanguage(this.user.id, lang).pipe(untilDestroyed(this)).subscribe();
    }
}
