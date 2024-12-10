import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AliquoteIvaComponent } from './aliquote-iva.component';
import { AliquotaIvaService } from './aliquote-iva.service';
import { AliquoteIvaListComponent } from './aliquote-iva-list/aliquote-iva-list.component';

export default [
    {
        path: '',
        component: AliquoteIvaComponent,
        children: [
            {
                path: '',
                component: AliquoteIvaListComponent,
                resolve: {
                    users: () => inject(AliquotaIvaService).list(),
                },
                children: [
                    {
                        path: ':id',
                        component: AliquoteIvaComponent,
                    },
                    {
                        path: 'new',
                        component: AliquoteIvaComponent,
                    },
                ],
            },
        ],
    },
    {
        path: ':id/aliquotaIva',
        component: AliquoteIvaComponent,
        resolve: {
            applications: () => inject(AliquotaIvaService).list(),
            // user: userResolver,
        },
    },
    {
        path: ':id/aliquotaIva/:aliquotaIvaId',
        component: AliquoteIvaComponent,
        resolve: {
            applications: () => inject(AliquotaIvaService).list(),
            // user: userResolver,
        },
    },
] as Routes;
