import { Routes } from '@angular/router';
import { Roles } from 'app/core/user/user.roles';

export default [
    {
        path: 'admin/scope-groups',
        data: {
            roles: [Roles.OWNER],
        },
        loadChildren: () => import('app/modules/admin/scope-groups/scope-groups.routes'),
    },

    { path: '', redirectTo: 'tags', pathMatch: 'full' },
    {
        path: 'tags',
        loadChildren: () => import('app/modules/configuration/tags/tags.routes'),
    },

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

    //TODO: aggiungere la rotta per il modulo tipi pagamento
    // { path: '', redirectTo: 'aliquote-iva', pathMatch: 'full' },
    // {
    //     path: 'aliquote-iva',
    //     loadChildren: () => import('app/modules/configuration/aliquote-iva/aliquote-iva.routes'),
    // },

    { path: '', redirectTo: 'price-list', pathMatch: 'full' },
    {
        path: 'price-list',
        loadChildren: () => import('app/modules/configuration/price-list/price-list.routes'),
    },
] as Routes;
