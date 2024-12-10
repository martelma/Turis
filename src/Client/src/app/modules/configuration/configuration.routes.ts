import { Routes } from '@angular/router';

export default [
    { path: '', redirectTo: 'languages', pathMatch: 'full' },
    {
        path: 'languages',
        loadChildren: () => import('app/modules/configuration/languages/languages.routes'),
    },

    { path: '', redirectTo: 'aliquote-iva', pathMatch: 'full' },
    {
        path: 'aliquote-iva',
        loadChildren: () => import('app/modules/configuration/aliquote-iva/aliquote-iva.routes'),
    },

    { path: '', redirectTo: 'price-list', pathMatch: 'full' },
    {
        path: 'price-list',
        loadChildren: () => import('app/modules/configuration/price-list/price-list.routes'),
    },
] as Routes;
