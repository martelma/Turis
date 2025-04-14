import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { RoleListComponent } from './role-list/role-list.component';
import { ApplicationRoleService } from './role.service';
import { RolesComponent } from './roles.component';

export default [
    {
        path: '',
        component: RolesComponent,
        children: [
            {
                path: '',
                component: RoleListComponent,
                resolve: {
                    users: () => inject(ApplicationRoleService).list(),
                },
                children: [
                    {
                        path: ':id',
                        component: RolesComponent,
                    },
                    {
                        path: 'new',
                        component: RolesComponent,
                    },
                ],
            },
        ],
    },
    {
        path: ':id/role',
        component: RolesComponent,
        resolve: {
            applications: () => inject(ApplicationRoleService).list(),
            // user: userResolver,
        },
    },
    {
        path: ':id/role/:roleId',
        component: RolesComponent,
        resolve: {
            applications: () => inject(ApplicationRoleService).list(),
            // user: userResolver,
        },
    },
] as Routes;
