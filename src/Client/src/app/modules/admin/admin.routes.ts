import { Routes } from '@angular/router';

export default [
    { path: '', redirectTo: 'console', pathMatch: 'full' },
    {
        path: 'users',
        loadChildren: () => import('app/modules/admin/users/users.routes'),
    },
    {
        path: 'console',
        loadChildren: () => import('app/modules/admin/console/console.routes'),
    },
    {
        path: 'scope-groups',
        loadChildren: () => import('app/modules/admin/scope-groups/scope-groups.routes'),
    },
    {
        path: 'scopes',
        loadChildren: () => import('app/modules/admin/scopes/scopes.routes'),
    },
    {
        path: 'roles',
        loadChildren: () => import('app/modules/admin/roles/roles.routes'),
    },
] as Routes;
