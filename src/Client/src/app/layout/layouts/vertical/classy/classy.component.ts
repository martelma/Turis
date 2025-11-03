import { NgIf } from '@angular/common';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BaseCommands } from 'app/commands/base.commands';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { MessagesComponent } from 'app/layout/common/messages/messages.component';
import { NotificationsComponent } from 'app/layout/common/notifications/notifications.component';
import { QuickChatComponent } from 'app/layout/common/quick-chat/quick-chat.component';
import { SearchComponent } from 'app/layout/common/search/search.component';
import { ShortcutsComponent } from 'app/layout/common/shortcuts/shortcuts.component';
import { UserComponent } from 'app/layout/common/user/user.component';
import { CdModalComponent } from 'app/shared/components/cd-modal/cd-modal.component';
import { ErrorModalCommand } from 'app/shared/types/error-modal.types';
import { filter, map, tap } from 'rxjs';
import packageInfo from '../../../../../../package.json';
import { AdminService } from 'app/modules/admin/admin.service';
import { APPLICATION_CONFIGURATION_TOKEN } from 'app/configurations/application-configuration.token';
import { ApplicationConfiguration } from 'app/configurations/application-configuration.types';

@UntilDestroy()
@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        FuseLoadingBarComponent,
        FuseVerticalNavigationComponent,
        NotificationsComponent,
        UserComponent,
        NgIf,
        MatIconModule,
        MatButtonModule,
        LanguagesComponent,
        FuseFullscreenComponent,
        SearchComponent,
        ShortcutsComponent,
        MessagesComponent,
        RouterOutlet,
        QuickChatComponent,
        CdModalComponent,
    ],
})
export class ClassyLayoutComponent implements OnInit {
    isScreenSmall: boolean;
    navigation: Navigation;
    isDevMode = this.applicationConfig.dev;
    isStagingMode = this.applicationConfig.staging;
    user: User;

    public errorModal: ErrorModalCommand = undefined;

    version = packageInfo.version;

    apiConfigurations: any[] = [];

    constructor(
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _adminService: AdminService,
        @Inject(APPLICATION_CONFIGURATION_TOKEN) protected applicationConfig: ApplicationConfiguration,
    ) {}

    get currentYear(): number {
        return new Date().getFullYear();
    }

    ngOnInit(): void {
        this._loadBackendConfiguration();

        this._loadData();

        this._subscribeMediaChange();

        this._subscribeOnModalError();
    }

    private _loadData(): void {
        // LOADS USER PROFILE
        this._userService.me().pipe(untilDestroyed(this)).subscribe();

        this._userService.user$
            .pipe(
                filter(user => !!user),
                tap(user => {
                    this.user = user;
                }),
                untilDestroyed(this),
            )
            .subscribe();

        this._navigationService.navigation$
            .pipe(
                map(navigation => {
                    this.navigation = navigation;
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    private _subscribeMediaChange(): void {
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$.pipe(untilDestroyed(this)).subscribe(({ matchingAliases }) => {
            // Check if the screen is small
            this.isScreenSmall = !matchingAliases.includes('md');
        });
    }

    private _subscribeOnModalError(): void {
        BaseCommands.instance.onShowModalError
            .pipe(
                tap(errorModal => {
                    this.errorModal = errorModal;
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }

    private _loadBackendConfiguration(): void {
        this.apiConfigurations = [];

        this._adminService
            .backendConfiguration()
            .pipe(untilDestroyed(this))
            .subscribe((items: any) => {
                this.apiConfigurations = items;
            });
    }

    getEnvironment(): string {
        return this.apiConfigurations.find(x => x.key === 'Environment')?.value;
    }

    log(obj: any) {
        console.log(obj);
    }
}
