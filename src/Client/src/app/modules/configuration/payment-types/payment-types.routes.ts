import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AliquotaIvaService } from '../aliquote-iva/aliquote-iva.service';
import { PaymentTypesComponent } from './payment-types.component';
import { PaymentTypesListComponent } from './payment-types-list/payment-types-list.component';

export default [
    {
        path: '',
        component: PaymentTypesComponent,
        children: [
            {
                path: '',
                component: PaymentTypesListComponent,
                resolve: {
                    users: () => inject(AliquotaIvaService).list(),
                },
                children: [
                    {
                        path: ':id',
                        component: PaymentTypesComponent,
                    },
                    {
                        path: 'new',
                        component: PaymentTypesComponent,
                    },
                ],
            },
        ],
    },
    {
        path: ':id/aliquotaIva',
        component: PaymentTypesComponent,
        resolve: {
            applications: () => inject(AliquotaIvaService).list(),
            // user: userResolver,
        },
    },
    {
        path: ':id/aliquotaIva/:aliquotaIvaId',
        component: PaymentTypesComponent,
        resolve: {
            applications: () => inject(AliquotaIvaService).list(),
            // user: userResolver,
        },
    },
] as Routes;
