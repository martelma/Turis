import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { hasRoleGuard } from './core/auth/guards/has-role.guard';
import { Roles } from './core/user/user.roles';
import { ServiceUnavailableComponent } from './pages/service-unavailable/service-unavailable.component';

export const appRoutes: Route[] = [
    // Redirect empty path to '/sign-in'
    { path: '', pathMatch: 'full', redirectTo: 'home' },

    // Redirect signed-in user to the '/home'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'home' },

    { path: 'unauthorized', component: UnauthorizedComponent },

    { path: 'service-unavailable', component: ServiceUnavailableComponent },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'confirmation-required',
                loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes'),
            },
            {
                path: 'forgot-password',
                loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes'),
            },
            {
                path: 'reset-password',
                loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes'),
            },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
        ],
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [{ path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes') }],
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [{ path: 'support', loadChildren: () => import('app/modules/support/support.routes') }],
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver,
        },
        children: [
            { path: 'home', loadChildren: () => import('app/modules/admin/dashboard/dashboard.routes') },
            { path: 'collaborator', loadChildren: () => import('app/modules/collaborator/collaborator.routes') },
            { path: 'calendar', loadChildren: () => import('app/modules/calendar/calendar.routes') },
            { path: 'service', loadChildren: () => import('app/modules/service/service.routes') },
            { path: 'contact', loadChildren: () => import('app/modules/contact/contact.routes') },
            { path: 'document', loadChildren: () => import('app/modules/document/document.routes') },
            { path: 'payment', loadChildren: () => import('app/modules/payment/payment.routes') },
            { path: 'journal-entry', loadChildren: () => import('app/modules/journal-entry/journal-entry.routes') },
            {
                path: 'profile',
                loadChildren: () => import('app/modules/admin/users/profile/profile.routes'),
            },
            {
                path: 'admin',
                canActivate: [hasRoleGuard],
                canActivateChild: [hasRoleGuard],
                data: {
                    roles: [Roles.ADMINISTRATOR],
                },
                loadChildren: () => import('app/modules/admin/admin.routes'),
            },
            {
                path: 'configuration',
                canActivate: [hasRoleGuard],
                canActivateChild: [hasRoleGuard],
                data: {
                    roles: [Roles.CONFIGURATION],
                },
                loadChildren: () => import('app/modules/configuration/configuration.routes'),
            },
        ],
    },
];
