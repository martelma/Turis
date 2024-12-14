import { UserService } from './../../../../core/user/user.service';
import { Guid } from 'guid-typescript';
import { AsyncPipe, I18nPluralPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormControl,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { debounceTime, map, tap } from 'rxjs';
import { AvatarUsersService } from '../avatar-users.service';
import { TranslocoModule } from '@ngneat/transloco';
import { SearchPipe } from 'app/pipes';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User } from 'app/core/user/user.types';
import { BackButtonComponent } from 'app/shared/components/back-button/back-button.component';
import { trackByFn } from '../../../../shared/utils';
import { BaseSearchParameters, PaginatedList, defaultPaginatedList } from '../../../../shared/types/shared.types';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@UntilDestroy()
@Component({
    selector: 'users-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        RouterOutlet,
        RouterLink,
        NgIf,
        NgFor,
        NgClass,
        FormsModule,
        ReactiveFormsModule,
        AsyncPipe,
        SearchPipe,
        I18nPluralPipe,
        MatSidenavModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatPaginatorModule,
        TranslocoModule,
        BackButtonComponent,
    ],
})
export class UsersListComponent implements OnInit {
    @Input() debounce = 300;
    @Input() minLength = 2;

    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    users: PaginatedList<User> = defaultPaginatedList;

    usersTableColumns: string[] = ['name', 'email', 'role'];
    drawerMode: 'side' | 'over';
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    orderBy = 'userName';

    selectedUser: User;

    public isCreatingUser = false;
    public creatingUserForm: FormGroup = null;

    trackByFn = trackByFn;

    get queryParameters(): BaseSearchParameters {
        return {
            pattern: this.searchInputControl.value,
            pageIndex: this.users.pageIndex,
            pageSize: this.users.pageSize,
            orderBy: this.orderBy,
        };
    }

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _usersService: AvatarUsersService,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _formBuilder: FormBuilder,
        protected userService: UserService,
    ) {
        const snapshot = this._activatedRoute.snapshot;
        const params = { ...snapshot.queryParams };
        if ('otp' in params) {
            delete params.otp;
            this._router.navigate([], { queryParams: params });
        }
    }

    ngOnInit(): void {
        this._subscribeUser();

        this._subscribeUsers();

        this._subscribeMediaChange();

        this._subscribeMatDrawerOpenedChange();

        this._subscribeSearchInputControlValueChanges();
    }

    private _subscribeUser(): void {
        this._usersService.user$
            .pipe(
                tap((user: User) => {
                    this.selectedUser = user;
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    private _subscribeUsers(): void {
        this._usersService.users$
            .pipe(
                tap((list: PaginatedList<User>) => {
                    this.users = list;
                }),
                untilDestroyed(this),
            )
            .subscribe();
    }

    private _subscribeMediaChange(): void {
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$.pipe(untilDestroyed(this)).subscribe(({ matchingAliases }) => {
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

    createNewContactForm(): void {
        this.isCreatingUser = true;

        this.creatingUserForm = this._formBuilder.group({
            id: [Guid.create().toString()],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', Validators.required],
        });

        this.createUser();
    }

    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
    }

    createUser(): void {
        this._router.navigate(['./', 'new'], { relativeTo: this._activatedRoute });
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
