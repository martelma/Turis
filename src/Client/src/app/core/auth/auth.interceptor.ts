import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BaseCommands } from 'app/commands/base.commands';
import { APPLICATION_CONFIGURATION_TOKEN } from 'app/configurations/application-configuration.token';
import { ApplicationConfiguration } from 'app/configurations/application-configuration.types';
import { AuthService } from 'app/core/auth/auth.service';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import * as moment from 'moment-timezone';
import { ErrorModalCommand } from 'app/shared/components/ui/modal/modal.types';

/**
 * Intercept http requests and performs token-related operations on them
 *
 * @param request the intercepted http request
 * @param next the http handler function to handle http requests
 */
export const authInterceptor = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const applicationConfig = inject(APPLICATION_CONFIGURATION_TOKEN);

    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        request = addToken(request, accessToken, applicationConfig);
    }

    return next(request).pipe(
        catchError(error => {
            if (error.error instanceof ErrorEvent) {
                console.error('[authInterceptor] - client side error', error);
                return throwError(error);
            }

            console.error('[authInterceptor] - server side error', error);

            // Check if the error is due to an expired access token
            if (error.status === HttpStatusCode.Unauthorized && accessToken) {
                return handleTokenExpired(authService, router, request, next, applicationConfig);
            }

            // When the access token is not present but the first request is unauthorized
            if (error.status === HttpStatusCode.Unauthorized) {
                // Redirect to the sign-in page with a redirectUrl param
                const redirectURL = `redirectURL=${applicationConfig.appUrl}${router.routerState.snapshot.url}&appId=${applicationConfig.applicationId}`;

                // IMPORTANT: Avoids to redirect to sign-in if the user was already redirected there
                if (!router.routerState.snapshot.url.startsWith('/sign-in')) {
                    // Redirect to the workspace sign-in page with a redirectUrl param
                    window.location.replace(`${applicationConfig.appUrl}/sign-in?${redirectURL}`);
                }
            }

            // https://github.com/angular/angular/issues/19888
            // When request of type Blob, the error is also in Blob instead of object of the json data
            if (
                error instanceof HttpErrorResponse &&
                error.error instanceof Blob &&
                error.error.type === 'application/problem+json'
            ) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return new Promise<any>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e: Event) => {
                        try {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const errmsg = JSON.parse((<any>e.target).result);
                            console.error('errmsg', errmsg);

                            const errorCommand: ErrorModalCommand = {
                                title: '',
                                message: '',
                                error: {
                                    title: errmsg.title,
                                    innerException: null,
                                },
                                severity: 'error',
                            };

                            const httpErrorResponse = new HttpErrorResponse({
                                error: errmsg,
                                headers: error.headers,
                                status: error.status,
                                statusText: error.statusText,
                                // url: error.url
                            });

                            // Check if the request wants to skip centralized error handling
                            const skipCentralizedError = request.headers.has('X-Skip-Error-Interceptor');
                            if (!skipCentralizedError) {
                                BaseCommands.instance.showModalError(errorCommand);
                            }

                            reject(httpErrorResponse);
                        } catch (e) {
                            reject(error);
                        }
                    };
                    reader.onerror = () => {
                        reject(error);
                    };
                    reader.readAsText(error.error);
                });
            }

            // Check if the request wants to skip centralized error handling
            const skipCentralizedError = request.headers.has('X-Skip-Error-Interceptor');
            if (!skipCentralizedError) {
                BaseCommands.instance.showModalError(error);
            }

            return throwError(error);
        }),
    );
};

const addToken = (
    request: HttpRequest<any>,
    token: string,
    applicationConfig: ApplicationConfiguration,
): HttpRequest<any> => {
    return request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`,
            Timezone: `${moment.tz.guess()}`,
            'X-Application-Id': applicationConfig.applicationId,
        },
    });
};

const handleTokenExpired = (
    authService: AuthService,
    router: Router,
    request: HttpRequest<any>,
    next: HttpHandlerFn,
    applicationConfig: ApplicationConfiguration,
): Observable<HttpEvent<any>> => {
    // Call the refresh token endpoint to get a new access token
    return authService.refreshAccessToken().pipe(
        switchMap(() => {
            const newAccessToken = localStorage.getItem('accessToken');
            // Retry the original request with the new access token
            return next(addToken(request, newAccessToken, applicationConfig));
        }),
        catchError(error => {
            localStorage.clear();

            // Handle refresh token error (e.g., redirect to login page)
            console.error('Error handling expired access token:', error);

            // Redirect to the sign-in page with a redirectUrl param
            const redirectURL = `redirectURL=${applicationConfig.appUrl}${router.routerState.snapshot.url}`;
            window.location.replace(`${applicationConfig.appUrl}/sign-in?${redirectURL}`);

            return throwError(error);
        }),
    );
};
