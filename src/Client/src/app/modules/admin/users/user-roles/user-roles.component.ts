import { NgFor, NgIf } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent } from '@fuse/components/alert';
import { FuseCardComponent } from '@fuse/components/card';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User } from 'app/core/user/user.types';
import { trackByFn } from 'app/shared';
import { ApplicationRoleService } from '../../roles/role.service';
import { ApplicationRole } from '../../roles/role.types';
import { UsersService } from '../users.service';

@UntilDestroy()
@Component({
    selector: 'app-user-roles',
    templateUrl: './user-roles.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        ReactiveFormsModule,
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatGridListModule,
        MatMenuModule,
        MatTooltipModule,
        MatTabsModule,
        TranslocoModule,
        FuseCardComponent,
        FuseAlertComponent,
    ],
})
export class UserRolesComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() debounce = 500;
    @Input() cols = 4;
    @Input() applicationRoles: ApplicationRole[] = [];
    @Input() userRoles: ApplicationRole[] = [];

    // User
    user: User = null;
    userId: string;

    onlyAssignedRoles = false;

    trackByFn = trackByFn;

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _applicationRoleService: ApplicationRoleService,
        private _usersService: UsersService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnChanges(): void {
        this._changeDetectorRef.detectChanges();
    }

    ngOnInit(): void {
        this._subscribeUser();

        this._applicationRoleService
            .listEntities()
            .pipe(untilDestroyed(this))
            .subscribe(data => {
                this.applicationRoles = data.items;
                console.log('this.user', this.user);
                console.log('this.applicationRoles', this.applicationRoles);
            });
    }

    ngAfterViewInit(): void {}

    hasUserRole(role: ApplicationRole): boolean {
        return this.user?.roles?.find(r => r.toLowerCase() === role.name.toLowerCase()) !== undefined;
    }

    private _subscribeUser(): void {
        this._usersService.user$.pipe(untilDestroyed(this)).subscribe((user: User) => {
            this.user = user;

            this._changeDetectorRef.detectChanges();
        });
    }

    addRole(role: ApplicationRole): void {
        const newUser: any = {
            userId: this.user.id,
            email: this.user.email,
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            userName: this.user.userName,
            language: this.user.language,
            roles: [],
        };

        this.user?.applications?.forEach(app => {
            app.roles.forEach(r => {
                newUser.roles.push(r.id.toLowerCase());
            });
        });

        newUser.roles?.push(role.id.toLowerCase());
        this._updateUser(newUser);
    }

    removeRole(role: ApplicationRole): void {
        const newUser: any = {
            userId: this.user.id,
            email: this.user.email,
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            userName: this.user.userName,
            language: this.user.language,
            roles: [],
        };

        this.user?.applications?.forEach(app => {
            app.roles.forEach(r => {
                newUser.roles.push(r.id.toLowerCase());
            });
        });

        newUser.roles?.splice(newUser.roles?.indexOf(role.id.toLowerCase()), 1);
        this._updateUser(newUser);
    }

    private _updateUser(user: any): void {
        this._usersService
            .updateUser(user)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                // this._applicationsService
                //     .getApplicationUserById(this.selectedApplicationId, this.user?.id)
                //     .pipe(untilDestroyed(this))
                //     .subscribe();
            });
    }
}
