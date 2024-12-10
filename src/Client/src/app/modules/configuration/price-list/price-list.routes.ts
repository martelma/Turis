import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { PriceListComponent } from './price-list.component';
import { PriceListService } from './price-list.service';
import { PriceListListComponent } from './price-list-list/price-list-list.component';

export default [
    {
        path: '',
        component: PriceListComponent,
        children: [
            {
                path: '',
                component: PriceListListComponent,
                resolve: {
                    users: () => inject(PriceListService).list(),
                },
                children: [
                    {
                        path: ':id',
                        component: PriceListComponent,
                    },
                    {
                        path: 'new',
                        component: PriceListComponent,
                    },
                ],
            },
        ],
    },
    {
        path: ':id/priceList',
        component: PriceListComponent,
        resolve: {
            applications: () => inject(PriceListService).list(),
            // user: userResolver,
        },
    },
    {
        path: ':id/priceList/:priceListId',
        component: PriceListComponent,
        resolve: {
            applications: () => inject(PriceListService).list(),
            // user: userResolver,
        },
    },
] as Routes;
