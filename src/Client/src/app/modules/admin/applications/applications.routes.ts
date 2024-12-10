import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot } from '@angular/router';
import { ApplicationsComponent } from './applications.component';
import { inject } from '@angular/core';
import { ApplicationsService } from 'app/modules/admin/applications/applications.service';
import { catchError, throwError } from 'rxjs';
import { ApplicationsListComponent } from './list/list.component';
import { ApplicationsDetailsComponent } from './details/details.component';
import { ApplicationRolesDetailsComponent } from './roles/details/details.component';
import { ApplicationRolesListComponent } from './roles/list/list.component';
import { ApplicationRolesComponent } from './roles/roles.component';
import { ApplicationScopeGroupsComponent } from './scope-groups/scope-groups.component';
import { ApplicationScopeGroupsListComponent } from './scope-groups/list/list.component';
import { ApplicationScopeGroupsDetailsComponent } from './scope-groups/details/details.component';
import { ApplicationScopesComponent } from './scopes/scopes.component';
import { ApplicationScopesListComponent } from './scopes/list/list.component';
import { ApplicationScopesDetailsComponent } from './scopes/details/details.component';

/**
 * Application resolver
 *
 * @param route
 * @param state
 */
const applicationResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const applicationsService = inject(ApplicationsService);
    const router = inject(Router);

    const id = route.paramMap.get('id');
    return applicationsService.getApplicationById(id).pipe(
        // Error here means the requested application is not available
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
 * Can deactivate applications details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateApplicationsDetails = (
    component: ApplicationsDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot,
) => {
    // Get the next route
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) {
        nextRoute = nextRoute.firstChild;
    }

    // If the next state doesn't contain '/applications'
    // it means we are navigating away from the
    // applications app
    if (!nextState.url.includes('/applications')) {
        // Let it navigate
        return true;
    }

    // If we are navigating to another application...
    if (nextRoute.paramMap.get('id')) {
        // Just navigate
        return true;
    }

    // Otherwise, close the drawer first, and then navigate
    return component.closeDrawer().then(() => true);
};

/**
 * Application role resolver
 *
 * @param route
 * @param state
 */
const applicationRoleResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const applicationsService = inject(ApplicationsService);
    const router = inject(Router);

    const appId = route.parent.paramMap.get('appId');
    const id = route.paramMap.get('roleId');
    return applicationsService.getApplicationRoleById(appId, id).pipe(
        // Error here means the requested application is not available
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
 * Can deactivate roles details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateRolesDetails = (
    component: ApplicationRolesDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot,
) => {
    // Get the next route
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) {
        nextRoute = nextRoute.firstChild;
    }

    // If the next state doesn't contain '/roles'
    // it means we are navigating away from the
    // roles
    if (!nextState.url.includes('/roles')) {
        // Let it navigate
        return true;
    }

    // If we are navigating to another item...
    if (nextRoute.paramMap.get('roleId')) {
        // Just navigate
        return true;
    }

    return true;
};

/**
 * Application scope resolver
 *
 * @param route
 * @param state
 */
const applicationScopeResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const applicationsService = inject(ApplicationsService);
    const router = inject(Router);

    const appId = route.parent.paramMap.get('appId');
    const id = route.paramMap.get('scopeId');
    return applicationsService.getApplicationScopeById(appId, id).pipe(
        // Error here means the requested application is not available
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
 * Can deactivate scopes details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateScopesDetails = (
    component: ApplicationScopesDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot,
) => {
    // Get the next route
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) {
        nextRoute = nextRoute.firstChild;
    }

    // If the next state doesn't contain '/scopes'
    // it means we are navigating away from the
    // scopes
    if (!nextState.url.includes('/scopes')) {
        // Let it navigate
        return true;
    }

    // If we are navigating to another item...
    if (nextRoute.paramMap.get('scopeId')) {
        // Just navigate
        return true;
    }

    return true;
};

/**
 * Application scope group resolver
 *
 * @param route
 * @param state
 */
const applicationScopeGroupResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const applicationsService = inject(ApplicationsService);
    const router = inject(Router);

    const appId = route.parent.paramMap.get('appId');
    const id = route.paramMap.get('scopeGroupId');
    return applicationsService.getApplicationScopeGroupById(appId, id).pipe(
        // Error here means the requested application is not available
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
 * Can deactivate scope groups details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateScopeGroupsDetails = (
    component: ApplicationScopeGroupsDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot,
) => {
    // Get the next route
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) {
        nextRoute = nextRoute.firstChild;
    }

    // If the next state doesn't contain '/scope-groups'
    // it means we are navigating away from the
    // scope-groups
    if (!nextState.url.includes('/scope-groups')) {
        // Let it navigate
        return true;
    }

    // If we are navigating to another item...
    if (nextRoute.paramMap.get('scopeGroupId')) {
        // Just navigate
        return true;
    }

    return true;
};

export default [
    {
        path: '',
        component: ApplicationsComponent,
        resolve: {
            applications: () => inject(ApplicationsService).getApplications(),
        },
        children: [
            {
                path: '',
                component: ApplicationsListComponent,
                resolve: {
                    applications: () => inject(ApplicationsService).getApplications(),
                },
                children: [
                    {
                        path: ':id',
                        component: ApplicationsDetailsComponent,
                        resolve: {
                            application: applicationResolver,
                        },
                        canDeactivate: [canDeactivateApplicationsDetails],
                    },
                    {
                        path: 'new',
                        component: ApplicationsDetailsComponent,
                        resolve: {
                            application: applicationResolver,
                        },
                        canDeactivate: [canDeactivateApplicationsDetails],
                    },
                ],
            },
        ],
    },
    {
        path: ':appId/roles',
        component: ApplicationRolesComponent,
        children: [
            {
                path: '',
                component: ApplicationRolesListComponent,
                children: [
                    {
                        path: ':roleId',
                        component: ApplicationRolesDetailsComponent,
                        resolve: {
                            application: applicationRoleResolver,
                        },
                        canDeactivate: [canDeactivateRolesDetails],
                    },
                    {
                        path: 'new',
                        component: ApplicationRolesDetailsComponent,
                        resolve: {
                            application: applicationRoleResolver,
                        },
                        canDeactivate: [canDeactivateRolesDetails],
                    },
                ],
            },
        ],
    },
    {
        path: ':appId/scopes',
        component: ApplicationScopesComponent,
        children: [
            {
                path: '',
                component: ApplicationScopesListComponent,
                children: [
                    {
                        path: ':scopeId',
                        component: ApplicationScopesDetailsComponent,
                        resolve: {
                            application: applicationScopeResolver,
                        },
                        canDeactivate: [canDeactivateScopesDetails],
                    },
                    {
                        path: 'new',
                        component: ApplicationScopesDetailsComponent,
                        resolve: {
                            application: applicationScopeResolver,
                        },
                        canDeactivate: [canDeactivateScopesDetails],
                    },
                ],
            },
        ],
    },
    {
        path: ':appId/scope-groups',
        component: ApplicationScopeGroupsComponent,
        children: [
            {
                path: '',
                component: ApplicationScopeGroupsListComponent,
                children: [
                    {
                        path: ':scopeGroupId',
                        component: ApplicationScopeGroupsDetailsComponent,
                        resolve: {
                            application: applicationScopeGroupResolver,
                        },
                        canDeactivate: [canDeactivateScopeGroupsDetails],
                    },
                    {
                        path: 'new',
                        component: ApplicationScopeGroupsDetailsComponent,
                        resolve: {
                            application: applicationScopeGroupResolver,
                        },
                        canDeactivate: [canDeactivateScopeGroupsDetails],
                    },
                ],
            },
        ],
    },
] as Route[];
