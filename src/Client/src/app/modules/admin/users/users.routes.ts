import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { UsersDetailsComponent } from './details/details.component';
import { UsersListComponent } from './list/list.component';
import { UsersComponent } from './users.component';
import { ContactApplicationsComponent as UserApplicationsComponent } from './applications/applications.component';
import { UsersService } from './users.service';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApplicationsService } from '../applications/applications.service';

/**
 * User resolver
 *
 * @param route
 * @param state
 */
const userResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const usersService = inject(UsersService);
    const router = inject(Router);

    return usersService.getUserById(route.paramMap.get('id')).pipe(
        // Error here means the requested item is not available
        catchError(error => {
            // Log the error
            console.error(error);

            // Get the parent url
            const parentUrl = state.url.split('/').slice(0, -1).join('/');

            // Navigate to there
            router.navigateByUrl(parentUrl);

            // Throw an error
            return throwError(error);
        }),
    );
};

/**
 * Can deactivate users details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateUsersDetails = (
    component: UsersDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot,
) => {
    // Get the next route
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) {
        nextRoute = nextRoute.firstChild;
    }

    // If the next state doesn't contain '/users'
    // it means we are navigating away from the
    // users app
    if (!nextState.url.includes('/users')) {
        // Let it navigate
        return true;
    }

    // If we are navigating to another user...
    if (nextRoute.paramMap.get('id')) {
        // Just navigate
        return true;
    }

    // Otherwise, close the drawer first, and then navigate
    return component.closeDrawer().then(() => true);
};

export default [
    {
        path: '',
        component: UsersComponent,
        children: [
            {
                path: '',
                component: UsersListComponent,
                resolve: {
                    users: () => inject(UsersService).getUsers(),
                },
                children: [
                    {
                        path: ':id',
                        component: UsersDetailsComponent,
                        resolve: {
                            user: userResolver,
                        },
                        canDeactivate: [canDeactivateUsersDetails],
                    },
                    {
                        path: 'new',
                        component: UsersDetailsComponent,
                        canDeactivate: [canDeactivateUsersDetails],
                    },
                ],
            },
        ],
    },
    {
        path: ':id/applications',
        component: UserApplicationsComponent,
        resolve: {
            applications: () => inject(ApplicationsService).getApplications(),
            user: userResolver,
        },
    },
    {
        path: ':id/applications/:applicationId',
        component: UserApplicationsComponent,
        resolve: {
            applications: () => inject(ApplicationsService).getApplications(),
            user: userResolver,
        },
    },
] as Routes;
