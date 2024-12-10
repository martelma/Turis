import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { LanguageComponent } from './languages.component';
import { LanguageListComponent } from './language-list/language-list.component';
import { LanguageService } from './language.service';

export default [
    {
        path: '',
        component: LanguageComponent,
        children: [
            {
                path: '',
                component: LanguageListComponent,
                resolve: {
                    users: () => inject(LanguageService).list(),
                },
                children: [
                    {
                        path: ':id',
                        component: LanguageComponent,
                    },
                    {
                        path: 'new',
                        component: LanguageComponent,
                    },
                ],
            },
        ],
    },
    {
        path: ':id/language',
        component: LanguageComponent,
        resolve: {
            applications: () => inject(LanguageService).list(),
            // user: userResolver,
        },
    },
    {
        path: ':id/language/:languageId',
        component: LanguageComponent,
        resolve: {
            applications: () => inject(LanguageService).list(),
            // user: userResolver,
        },
    },
] as Routes;
