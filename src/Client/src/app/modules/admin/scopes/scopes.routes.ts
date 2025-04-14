import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ApplicationScopeService } from './scope.service';
import { ApplicationScopesListComponent } from './scopes-list/scopes-list.component';
import { ApplicationScopesComponent } from './scopes.component';

export default [
    {
        path: '',
        component: ApplicationScopesComponent,
        children: [
            {
                path: '',
                component: ApplicationScopesListComponent,
                resolve: {
                    users: () => inject(ApplicationScopeService).list(),
                },
                children: [
                    {
                        path: ':id',
                        component: ApplicationScopesComponent,
                    },
                    {
                        path: 'new',
                        component: ApplicationScopesComponent,
                    },
                ],
            },
        ],
    },
    {
        path: ':id/scope',
        component: ApplicationScopesComponent,
        resolve: {
            applications: () => inject(ApplicationScopeService).list(),
            // user: userResolver,
        },
    },
    {
        path: ':id/scope/:scopeId',
        component: ApplicationScopesComponent,
        resolve: {
            applications: () => inject(ApplicationScopeService).list(),
            // user: userResolver,
        },
    },
] as Routes;
