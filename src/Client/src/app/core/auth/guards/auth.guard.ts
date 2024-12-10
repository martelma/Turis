import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { catchError, Observable, of, switchMap } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = ():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree => {
    const authService: AuthService = inject(AuthService);
    const router: Router = inject(Router);

    // Check the authentication status
    return authService.check().pipe(
        switchMap(() => of(true)),
        catchError(() => {
            router.navigate(['/service-unavailable']);
            return of(true);
        }),
    );
};
