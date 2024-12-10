import { HttpEvent, HttpHandlerFn, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BaseCommands } from 'app/commands/base.commands';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'environments/environment';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

/**
 * Intercept http requests and performs token-related operations on them
 *
 * @param request the intercepted http request
 * @param next the http handler function to handle http requests
 */
export const authInterceptor = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // const accessToken = localStorage.getItem('accessToken');
    const accessToken = authService.accessToken;
    if (accessToken) {
        request = addToken(request, accessToken);
    }

    return next(request).pipe(
        catchError(error => {
            // Check if the error is due to an expired access token
            if (error.status === HttpStatusCode.Unauthorized && accessToken) {
                return handleTokenExpired(authService, router, request, next);
            }

            // When the access token is not present but the first request is unauthorized
            if (error.status === HttpStatusCode.Unauthorized) {
                const redirectURL = router.routerState.snapshot.url;
                let options = {};
                if (redirectURL != null && redirectURL.trim().length) {
                    options = { queryParams: { redirectURL: router.routerState.snapshot.url } };
                }
                // Redirect to the workspace sign-in page with a redirectUrl param
                router.navigate([`sign-in`], options);
            }

            if (!error.message.includes('/avatar')) {
                BaseCommands.instance.showModalError(error);
            }

            return throwError(error);
        }),
    );
};

const addToken = (request: HttpRequest<any>, token: string): HttpRequest<any> => {
    return request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`,
            'X-Application-Id': environment.applicationId,
        },
    });
};

const handleTokenExpired = (
    authService: AuthService,
    router: Router,
    request: HttpRequest<any>,
    next: HttpHandlerFn,
): Observable<HttpEvent<any>> => {
    // Call the refresh token endpoint to get a new access token
    return authService.refreshAccessToken().pipe(
        switchMap(() => {
            const newAccessToken = localStorage.getItem('accessToken');
            // Retry the original request with the new access token
            return next(addToken(request, newAccessToken));
        }),
        catchError(error => {
            localStorage.clear();

            // Handle refresh token error (e.g., redirect to login page)
            console.error('Error handling expired access token:', error);

            // Redirect to the workspace sign-in page with a redirectUrl param
            router.navigate([`sign-in`], { queryParams: { redirectURL: router.routerState.snapshot.url } });

            return throwError(error);
        }),
    );
};
