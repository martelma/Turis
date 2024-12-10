import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
    UrlMatchResult,
    UrlSegment,
} from '@angular/router';
import { ServiceComponent } from './service.component';
import { ServiceDetailsComponent } from './service-details/service-details.component';
import { ServiceService } from './service.service';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ServiceListComponent } from './service-list/service-list.component';
import { ServiceEmptyDetailsComponent } from './service-empty-details/service-empty-details.component';

const serviceRouteMatcher: (url: UrlSegment[]) => UrlMatchResult = (url: UrlSegment[]) => {
    // Prepare consumed url and positional parameters
    let consumed = url;
    const posParams = {};

    if (url != null && url.length) {
        // IMPORTANT: Remove the id if exists to avoid to append multiple times
        if (url[0]) {
            consumed = url.slice(0, -1);
        }
    }

    return {
        consumed,
        posParams,
    };
};

const serviceResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const serviceService = inject(ServiceService);
    const router = inject(Router);

    const id = route.paramMap.get('id');
    if (id === 'new') {
        return serviceService.createEntity();
    }

    return serviceService.getById(id).pipe(
        // Error here means the requested service is either
        // not available on the requested page or not
        // available at all
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

export default [
    {
        path: '',
        component: ServiceComponent,
        resolve: {
            services: () => inject(ServiceService).listEntities(),
        },
        children: [
            {
                component: ServiceListComponent,
                matcher: serviceRouteMatcher,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: ServiceEmptyDetailsComponent,
                    },
                    {
                        path: ':id',
                        component: ServiceDetailsComponent,
                        resolve: {
                            service: serviceResolver,
                        },
                    },
                    {
                        path: 'new',
                        component: ServiceDetailsComponent,
                        resolve: {
                            service: serviceResolver,
                        },
                    },
                ],
            },
        ],
    },
] as Routes;
