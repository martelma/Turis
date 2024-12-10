import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { User } from 'app/core/user/user.types';
import { AuthService } from '../auth.service';
import { Roles } from 'app/core/user/user.roles';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const hasRoleGuard: CanActivateFn = (route, state) => {
    const router: Router = inject(Router);
    const user: User = inject(AuthService).storageUser;
    const expectedRoles: string[] = route.data['roles'];

    const application = user?.applications.find(x => x.name.toLowerCase() === 'turis');

    if (application?.roles?.some(x => x.name.toLowerCase() === Roles.OWNER.toLowerCase())) {
        return true;
    }

    if (application?.roles?.some(x => x.name.toLowerCase() === Roles.ADMINISTRATOR.toLowerCase())) {
        return true;
    }

    const hasRole: boolean = expectedRoles?.some(expectedRole =>
        application?.roles?.some(role => role.name.toLowerCase() === expectedRole.toLowerCase()),
    );

    return hasRole || router.navigate(['unauthorized']);
};
