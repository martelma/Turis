import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ApplicationScopesListComponent } from './list/list.component';
import { ApplicationScopesComponent } from './scopes.component';
import { ScopeService } from './scope.service';

export default [
    {
        path: '',
        component: ApplicationScopesComponent,
        children: [
            {
                path: '',
                component: ApplicationScopesListComponent,
                resolve: {
                    users: () => inject(ScopeService).list(),
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
            applications: () => inject(ScopeService).list(),
            // user: userResolver,
        },
    },
    {
        path: ':id/scope/:scopeId',
        component: ApplicationScopesComponent,
        resolve: {
            applications: () => inject(ScopeService).list(),
            // user: userResolver,
        },
    },
] as Routes;
