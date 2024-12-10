import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
    UrlMatchResult,
    UrlSegment,
} from '@angular/router';
import { ContactService } from './contact.service';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ContactListComponent } from './contact-list/contact-list.component';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { ContactComponent } from './contact.component';
import { ContactEmptyDetailsComponent } from './contact-empty-details/contact-empty-details.component';

const contactRouteMatcher: (url: UrlSegment[]) => UrlMatchResult = (url: UrlSegment[]) => {
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

const contactResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const contactService = inject(ContactService);
    const router = inject(Router);

    const id = route.paramMap.get('id');
    if (id === 'new') {
        return contactService.createEntity();
    }

    return contactService.getById(id).pipe(
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
        component: ContactComponent,
        resolve: {
            contacts: () => inject(ContactService).listEntities(),
        },
        children: [
            {
                component: ContactListComponent,
                matcher: contactRouteMatcher,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: ContactEmptyDetailsComponent,
                    },
                    {
                        path: ':id',
                        component: ContactDetailsComponent,
                        resolve: {
                            contact: contactResolver,
                        },
                    },
                    {
                        path: 'new',
                        component: ContactDetailsComponent,
                        resolve: {
                            contact: contactResolver,
                        },
                    },
                ],
            },
        ],
    },
] as Routes;
