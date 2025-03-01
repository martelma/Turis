import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { RolesComponent } from './roles.component';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleService } from './role.service';

export default [
    {
        path: '',
        component: RolesComponent,
        children: [
            {
                path: '',
                component: RoleListComponent,
                resolve: {
                    users: () => inject(RoleService).list(),
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
            applications: () => inject(RoleService).list(),
            // user: userResolver,
        },
    },
    {
        path: ':id/role/:roleId',
        component: RolesComponent,
        resolve: {
            applications: () => inject(RoleService).list(),
            // user: userResolver,
        },
    },
] as Routes;
