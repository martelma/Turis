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
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentService } from './document.service';
import { DocumentComponent } from './document.component';
import { DocumentDetailsComponent } from './document-details/document-details.component';
import { DocumentEmptyDetailsComponent } from './document-empty-details/document-empty-details.component';
import { DocumentNewComponent } from './document-new/document-new.component';

const documentRouteMatcher: (url: UrlSegment[]) => UrlMatchResult = (url: UrlSegment[]) => {
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

const documentResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const documentService = inject(DocumentService);
    const router = inject(Router);

    const id = route.paramMap.get('id');
    if (id === 'new') {
        return documentService.createEntity();
    }

    return documentService.getById(id).pipe(
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
        component: DocumentComponent,
        resolve: {
            documents: () => inject(DocumentService).listEntities(),
        },
        children: [
            {
                component: DocumentListComponent,
                matcher: documentRouteMatcher,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: DocumentEmptyDetailsComponent,
                    },
                    {
                        path: ':id',
                        component: DocumentDetailsComponent,
                        resolve: {
                            service: documentResolver,
                        },
                    },
                    {
                        path: 'new',
                        component: DocumentNewComponent,
                        resolve: {
                            service: documentResolver,
                        },
                    },
                ],
            },
        ],
    },
] as Routes;
