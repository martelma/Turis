import { CanActivateChildFn, CanActivateFn } from '@angular/router';
import { of } from 'rxjs';

export const NoAuthGuard: CanActivateFn | CanActivateChildFn = () => {
    // Allow the access
    return of(true);
};
