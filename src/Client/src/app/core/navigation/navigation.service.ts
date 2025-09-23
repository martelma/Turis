import { Injectable } from '@angular/core';
import { Navigation } from 'app/core/navigation/navigation.types';
import { Observable, ReplaySubject, of, tap } from 'rxjs';
import { Roles } from '../user/user.roles';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _navigation: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(1);

    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    get(): Observable<Navigation> {
        const securityCode = localStorage.getItem('securityCode');

        const navigation: Observable<Navigation> = of({
            default: [
                {
                    id: 'admin',
                    title: 'Navigation.Admin',
                    type: 'collapsable',
                    icon: 'heroicons_outline:key',
                    roles: [Roles.ADMINISTRATOR],
                    children: [
                        {
                            id: 'console',
                            title: 'Navigation.Console',
                            type: 'basic',
                            icon: 'heroicons_outline:cog-8-tooth',
                            link: 'admin/console',
                        },
                        {
                            id: 'elmah',
                            title: 'Navigation.Elmah',
                            type: 'basic',
                            icon: 'heroicons_outline:circle-stack',
                            link: `${environment.baseUrl}/elmah?securityCode=${securityCode}`,
                            externalLink: true,
                            target: '_blank',
                        },
                        {
                            id: 'swagger',
                            title: 'Navigation.Swagger',
                            type: 'basic',
                            icon: 'heroicons_outline:wrench-screwdriver',
                            link: `${environment.baseUrl}/swagger`,
                            externalLink: true,
                            target: '_blank',
                        },
                        {
                            id: 'hangfire',
                            title: 'Navigation.Hangfire',
                            type: 'basic',
                            icon: 'heroicons_outline:fire',
                            link: `${environment.baseUrl}/hangfire?securityCode=${securityCode}`,
                            externalLink: true,
                            target: '_blank',
                        },
                    ],
                },
                {
                    id: 'home',
                    title: 'Navigation.Home',
                    type: 'basic',
                    icon: 'heroicons_outline:home',
                    link: '/home',
                },
                {
                    id: 'calendar',
                    title: 'Navigation.Calendar',
                    type: 'basic',
                    icon: 'heroicons_outline:calendar',
                    link: '/calendar',
                },
                {
                    id: 'service',
                    title: 'Navigation.Service',
                    type: 'basic',
                    icon: 'heroicons_outline:square-3-stack-3d',
                    link: '/service',
                },
                {
                    id: 'contact',
                    title: 'Navigation.Contact',
                    type: 'basic',
                    icon: 'heroicons_outline:users',
                    link: '/contact',
                },
                {
                    id: 'document',
                    title: 'Navigation.Document',
                    type: 'basic',
                    icon: 'heroicons_outline:document-duplicate',
                    link: '/document',
                },
                {
                    id: 'journal-entry',
                    title: 'Navigation.JournalEntry',
                    type: 'basic',
                    icon: 'heroicons_outline:currency-euro',
                    link: '/journal-entry',
                },
                {
                    id: 'configuration',
                    title: 'Navigation.Configuration',
                    type: 'collapsable',
                    icon: 'heroicons_outline:cog-6-tooth',
                    roles: [Roles.ADMINISTRATOR],
                    children: [
                        {
                            id: 'users',
                            title: 'Navigation.Users',
                            type: 'basic',
                            icon: 'heroicons_outline:user-group',
                            link: 'admin/users',
                        },
                        {
                            id: 'user-management',
                            title: 'Navigation.UserManagement',
                            type: 'collapsable',
                            icon: 'heroicons_outline:cog-6-tooth',
                            roles: [Roles.OWNER],
                            children: [
                                {
                                    id: 'scope-groups',
                                    title: 'Navigation.ScopeGroups',
                                    type: 'basic',
                                    icon: 'heroicons_outline:fire',
                                    link: 'admin/scope-groups',
                                    roles: [Roles.OWNER],
                                },
                                {
                                    id: 'scopes',
                                    title: 'Navigation.Scopes',
                                    type: 'basic',
                                    icon: 'heroicons_outline:fire',
                                    link: 'admin/scopes',
                                    roles: [Roles.OWNER],
                                },
                                {
                                    id: 'roles',
                                    title: 'Navigation.Roles',
                                    type: 'basic',
                                    icon: 'heroicons_outline:fire',
                                    link: 'admin/roles',
                                },
                            ],
                        },
                        {
                            id: 'Tags',
                            title: 'Navigation.Tags',
                            type: 'basic',
                            icon: 'heroicons_outline:tag',
                            link: '/configuration/tags',
                            moduleName: 'tags',
                        },
                        {
                            id: 'Languages',
                            title: 'Navigation.Languages',
                            type: 'basic',
                            icon: 'heroicons_outline:language',
                            link: '/configuration/languages',
                            moduleName: 'languages',
                        },
                        {
                            id: 'AliquoteIva',
                            title: 'Navigation.AliquoteIva',
                            type: 'basic',
                            icon: 'heroicons_outline:table-cells',
                            link: '/configuration/aliquote-iva',
                            moduleName: 'AliquoteIva',
                        },
                        {
                            id: 'PaymentTypes',
                            title: 'Navigation.PaymentTypes',
                            type: 'basic',
                            icon: 'heroicons_outline:banknotes',
                            link: '/configuration/payment-types',
                            moduleName: 'PaymentTypes',
                        },
                        {
                            id: 'PriceList',
                            title: 'Navigation.PriceList',
                            type: 'basic',
                            icon: 'heroicons_outline:adjustments-vertical',
                            link: '/configuration/price-list',
                            moduleName: 'PriceList',
                        },
                    ],
                },
            ],
            horizontal: [],
        });

        return navigation.pipe(
            tap(navigation => {
                this._navigation.next(navigation);
            }),
        );
    }
}
