import { Routes } from '@angular/router';

export default [
    { path: '', redirectTo: 'console', pathMatch: 'full' },
    { path: 'console', loadChildren: () => import('app/modules/admin/console/console.routes') },
    {
        path: 'applications',
        loadChildren: () => import('app/modules/admin/applications/applications.routes'),
    },
    {
        path: 'users',
        loadChildren: () => import('app/modules/admin/users/users.routes'),
    },
] as Routes;
