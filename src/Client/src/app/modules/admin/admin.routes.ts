import { Routes } from '@angular/router';

export default [
    { path: '', redirectTo: 'console', pathMatch: 'full' },
    {
        path: 'users',
        loadChildren: () => import('app/modules/admin/users/users.routes'),
    },

    { path: '', redirectTo: 'scope-groups', pathMatch: 'full' },
    {
        path: 'scope-groups',
        loadChildren: () => import('app/modules/admin/scope-groups/scope-groups.routes'),
    },
] as Routes;
