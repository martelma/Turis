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
import { PaymentService } from './payment.service';
import { PaymentComponent } from './payment.component';
import { PaymentListComponent } from './payment-list/payment-list.component';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';
import { PaymentEmptyDetailsComponent } from './payment-empty-details/payment-empty-details.component';
import { PaymentNewComponent } from './payment-new/payment-new.component';

const paymentRouteMatcher: (url: UrlSegment[]) => UrlMatchResult = (url: UrlSegment[]) => {
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

const paymentResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const paymentService = inject(PaymentService);
    const router = inject(Router);

    const id = route.paramMap.get('id');
    if (id === 'new') {
        return paymentService.createEntity();
    }

    return paymentService.getById(id).pipe(
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
        component: PaymentComponent,
        resolve: {
            payments: () => inject(PaymentService).listEntities(),
        },
        children: [
            {
                path: 'new',
                pathMatch: 'full',
                component: PaymentNewComponent,
            },
            {
                component: PaymentListComponent,
                matcher: paymentRouteMatcher,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: PaymentEmptyDetailsComponent,
                    },
                    {
                        path: ':id',
                        component: PaymentDetailsComponent,
                        resolve: {
                            service: paymentResolver,
                        },
                    },
                ],
            },
        ],
    },
] as Routes;
