import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
    UrlMatchResult,
    UrlSegment,
} from '@angular/router';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { JournalEntryService } from './journal-entry.service';
import { JournalEntryComponent } from './journal-entry.component';
import { JournalEntryEmptyDetailsComponent } from './journal-entry-empty-details/journal-entry-empty-details.component';
import { JournalEntryDetailsComponent } from './journal-entry-details/journal-entry-details.component';
import { JournalEntryListComponent } from './journal-entry-list/journal-entry-list.component';

const journalEntryRouteMatcher: (url: UrlSegment[]) => UrlMatchResult = (url: UrlSegment[]) => {
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

const journalEntryResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const journalEntryService = inject(JournalEntryService);
    const router = inject(Router);

    const id = route.paramMap.get('id');
    if (id === 'new') {
        return journalEntryService.createEntity();
    }

    return journalEntryService.getById(id).pipe(
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
        component: JournalEntryComponent,
        resolve: {
            services: () => inject(JournalEntryService).listEntities(),
        },
        children: [
            {
                component: JournalEntryListComponent,
                matcher: journalEntryRouteMatcher,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: JournalEntryEmptyDetailsComponent,
                    },
                    {
                        path: ':id',
                        component: JournalEntryDetailsComponent,
                        resolve: {
                            service: journalEntryResolver,
                        },
                    },
                    {
                        path: 'new',
                        component: JournalEntryDetailsComponent,
                        resolve: {
                            service: journalEntryResolver,
                        },
                    },
                ],
            },
        ],
    },
] as Routes;
