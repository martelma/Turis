import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';
import { UserService } from 'app/core/user/user.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User } from 'app/core/user/user.types';
import { TranslocoModule } from '@jsverse/transloco';
import { trackByFn } from '../../../../shared/utils';
import { MatTabsModule } from '@angular/material/tabs';
import { FuseAlertComponent } from '@fuse/components/alert';
import { fuseAnimations } from '@fuse/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PaginatedList } from 'app/shared/types/shared.types';
import { UsersService } from '../users.service';
import { UsersListComponent } from '../list/list.component';
import { UsersFormComponent } from '../form/form.component';
import { ApplicationRole } from '../../roles/role.types';
import { UserRolesComponent } from '../user-roles/user-roles.component';
import { ApplicationRoleService } from '../../roles/role.service';

@UntilDestroy()
@Component({
    selector: 'users-details',
    styleUrls: ['./details.component.scss'],
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        RouterModule,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        TextFieldModule,
        DatePipe,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatRippleModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatSelectModule,
        MatOptionModule,
        MatDatepickerModule,
        MatTabsModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatPaginatorModule,
        TranslocoModule,
        FuseAlertComponent,
        FuseFindByKeyPipe,
        UsersFormComponent,
        UserRolesComponent,
    ],
})
export class UsersDetailsComponent implements OnInit {
    @Input() debounce = 300;

    trackByFn = trackByFn;

    user: User;
    isCreateUser = false;
    /*
        // Applications
        userApplications: PaginatedList<Application> = {
            items: [],
            pageIndex: 0,
            pageSize: 10,
            totalCount: 0,
            hasNextPage: false,
        };
        userApplicationsSearchInputControl: UntypedFormControl = new UntypedFormControl();
    */

    roles: PaginatedList<ApplicationRole> = {
        items: [],
        pageIndex: 0,
        pageSize: 10,
        totalCount: 0,
        hasNextPage: false,
    };

    userRoles: PaginatedList<ApplicationRole> = {
        items: [],
        pageIndex: 0,
        pageSize: 10,
        totalCount: 0,
        hasNextPage: false,
    };

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _usersListComponent: UsersListComponent,
        private _applicationRoleService: ApplicationRoleService,
        private _usersService: UsersService,
        private _router: Router,
        protected userService: UserService,
    ) {}

    ngOnInit(): void {
        // Open the drawer
        this._usersListComponent.matDrawer.open();

        this._subscribeActivatedRouteParams();

        this._subscribeUser();

        this._subscribeUserRoles();
    }

    private _subscribeActivatedRouteParams(): void {
        this._activatedRoute.params.pipe(untilDestroyed(this)).subscribe(params => {
            // Activates the create user mode
            this.isCreateUser = params.id === 'new';
        });
    }

    private _subscribeUser(): void {
        // Get the user
        this._usersService.user$.pipe(untilDestroyed(this)).subscribe((user: User) => {
            this.setUser(user);
        });
    }

    private _subscribeRoles(): void {
        // Get the roles
        this._applicationRoleService.roles$
            .pipe(untilDestroyed(this))
            .subscribe((list: PaginatedList<ApplicationRole>) => {
                this.roles = list;
                // console.log('roles', this.roles);

                this._changeDetectorRef.detectChanges();
            });
    }

    private _subscribeUserRoles(): void {
        // Get the user
        this._usersService.userRoles$.pipe(untilDestroyed(this)).subscribe((list: PaginatedList<ApplicationRole>) => {
            this.userRoles = list;
            // console.log('userRoles', this.userRoles);

            this._changeDetectorRef.detectChanges();
        });
    }

    private setUser(user: User): void {
        // Open the drawer in case it is closed
        this._usersListComponent.matDrawer.open();

        // Get the user
        this.user = user;

        if (this.user?.id) {
            this._usersService.getUserRoles(this.user.id).pipe(untilDestroyed(this)).subscribe();
        }

        // if (this.user?.id) {
        //     this._usersService.getUserApplications(this.user.id).pipe(untilDestroyed(this)).subscribe();
        // }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._usersListComponent.matDrawer.close();
    }

    closeCreateUserDrawer(): Promise<MatDrawerToggleResult> {
        // Navigate to the contact list component
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });

        // Close the matDrawer
        return this._usersListComponent.matDrawer.close();
    }

    closeEditDrawer(): void {
        this._usersService
            .getUserById(this.user?.id)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                if (this.isCreateUser) this.closeCreateUserDrawer();
                else this.closeDrawer();
            });
    }
}
