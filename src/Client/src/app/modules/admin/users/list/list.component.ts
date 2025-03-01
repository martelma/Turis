import { UserService } from './../../../../core/user/user.service';
import { Guid } from 'guid-typescript';
import { I18nPluralPipe, NgClass, NgIf } from '@angular/common';
import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { debounceTime, map } from 'rxjs';
import { UsersService } from '../users.service';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User } from 'app/core/user/user.types';
import { BackButtonComponent } from 'app/shared/components/back-button/back-button.component';
import { trackByFn } from '../../../../shared/utils';
import { BaseSearchParameters, PaginatedList, defaultPaginatedList } from '../../../../shared/types/shared.types';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ViewModeSelectorComponent } from 'app/shared/components/view-mode-selector/view-mode-selector.component';
import { ViewMode } from 'app/shared/components/view-mode-selector/view-mode-selector.types';
import { UserListComponent } from '../user-list/user-list.component';

@UntilDestroy()
@Component({
    selector: 'app-users-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        ReactiveFormsModule,
        RouterOutlet,
        I18nPluralPipe,
        MatSidenavModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatPaginatorModule,
        TranslocoModule,
        BackButtonComponent,
        ViewModeSelectorComponent,
        UserListComponent,
    ],
})
export class UsersListComponent implements OnInit {
    @Input() debounce = 300;
    @Input() minLength = 2;

    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    detailsWidth = 'w-1/2';

    viewMode: ViewMode = 'table';

    results: PaginatedList<User> = defaultPaginatedList;
    usersTableColumns: string[] = ['name', 'email', 'role'];
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    orderBy = 'userName';

    selectedUser: User;

    public isCreatingUser = false;
    public creatingUserForm: FormGroup = null;

    trackByFn = trackByFn;

    get users(): User[] {
        return this.results?.items ?? [];
    }

    get queryParameters(): BaseSearchParameters {
        return {
            pattern: this.searchInputControl.value,
            pageIndex: this.results.pageIndex,
            pageSize: this.results.pageSize,
            orderBy: this.orderBy,
        };
    }

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _usersService: UsersService,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _formBuilder: FormBuilder,
        protected userService: UserService,
    ) {}

    ngOnInit(): void {
        this._subscribeUser();

        this._subscribeUsers();

        this._subscribeMediaChange();

        this._subscribeMatDrawerOpenedChange();

        this._subscribeSearchInputControlValueChanges();
    }

    private _subscribeUser(): void {
        this._usersService.user$.pipe(untilDestroyed(this)).subscribe();
    }

    private _subscribeUsers(): void {
        this._usersService.users$.pipe(untilDestroyed(this)).subscribe((results: PaginatedList<User>) => {
            console.log(results);
            this.results = results;
        });
    }

    private _subscribeMediaChange(): void {
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$.pipe(untilDestroyed(this)).subscribe(({ matchingAliases }) => {
            // Check if the screen is small
            this.detailsWidth = !matchingAliases.includes('md') ? 'w-full' : 'w-1-2';

            // Set the drawerMode if the given breakpoint is active
            if (matchingAliases.includes('lg')) {
                this.drawerMode = 'side';
            } else {
                this.drawerMode = 'over';
            }
        });
    }

    private _subscribeMatDrawerOpenedChange(): void {
        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe(opened => {
            if (!opened) {
                // Remove the selected user when drawer closed
                this.selectedUser = null;
            }
        });
    }

    private _subscribeSearchInputControlValueChanges(): void {
        // Subscribe to the search field value changes
        this.searchInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe(value => {
                this._usersService
                    .getUsers({ ...this.queryParameters, pattern: value })
                    .pipe(untilDestroyed(this))
                    .subscribe();
            });
    }

    createUser(): void {
        this.isCreatingUser = true;

        this.creatingUserForm = this._formBuilder.group({
            id: [Guid.create().toString()],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', Validators.required],
        });

        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
    }

    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
    }

    onUserSelected(user: User): void {
        this.selectedUser = user;
    }

    handlePageEvent(event: PageEvent): void {
        this._usersService
            .getUsers({ ...this.queryParameters, pageIndex: event.pageIndex, pageSize: event.pageSize })
            .pipe(untilDestroyed(this))
            .subscribe();
    }
}
