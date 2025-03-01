import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { ApplicationScopeGroupsComponent } from './scope-groups.component';
import { ApplicationScopeGroupListComponent } from './scope-groups-list/scope-groups-list.component';
import { ApplicationScopeGroupService } from './scope-group.service';

export default [
    {
        path: '',
        component: ApplicationScopeGroupsComponent,
        children: [
            {
                path: '',
                component: ApplicationScopeGroupListComponent,
                resolve: {
                    users: () => inject(ApplicationScopeGroupService).list(),
                },
                children: [
                    {
                        path: ':id',
                        component: ApplicationScopeGroupsComponent,
                    },
                    {
                        path: 'new',
                        component: ApplicationScopeGroupsComponent,
                    },
                ],
            },
        ],
    },
    {
        path: ':id/scopeGroup',
        component: ApplicationScopeGroupsComponent,
        resolve: {
            applications: () => inject(ApplicationScopeGroupService).list(),
            // user: userResolver,
        },
    },
    {
        path: ':id/scopeGroup/:scopeGroupId',
        component: ApplicationScopeGroupsComponent,
        resolve: {
            applications: () => inject(ApplicationScopeGroupService).list(),
            // user: userResolver,
        },
    },
] as Routes;
