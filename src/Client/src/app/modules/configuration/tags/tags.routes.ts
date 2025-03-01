import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { TagComponent } from './tags.component';
import { TagListComponent } from './tag-list/tag-list.component';
import { TagService } from './tag.service';

export default [
    {
        path: '',
        component: TagComponent,
        children: [
            {
                path: '',
                component: TagListComponent,
                resolve: {
                    users: () => inject(TagService).list(),
                },
                children: [
                    {
                        path: ':id',
                        component: TagComponent,
                    },
                    {
                        path: 'new',
                        component: TagComponent,
                    },
                ],
            },
        ],
    },
    {
        path: ':id/tag',
        component: TagComponent,
        resolve: {
            applications: () => inject(TagService).list(),
            // user: userResolver,
        },
    },
    {
        path: ':id/tag/:tagId',
        component: TagComponent,
        resolve: {
            applications: () => inject(TagService).list(),
            // user: userResolver,
        },
    },
] as Routes;
