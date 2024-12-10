import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Constants } from 'app/constants';
import { User } from 'app/core/user/user.types';
import { AuthService } from '../auth.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const hasScopeGuard: CanActivateFn = (route, state) => {
    const router: Router = inject(Router);
    const user: User = inject(AuthService).storageUser;
    const expectedScopes: string[] = route.data['scopes'];

    const application = user?.applications.find(x => x.name === 'Workspace');

    if (application?.roles?.some(x => x.name.toLowerCase() === Constants.ROLE_OWNER.toLowerCase())) {
        return true;
    }

    if (application?.roles?.some(x => x.name.toLowerCase() === Constants.ROLE_ADMINISTRATOR.toLowerCase())) {
        return true;
    }

    const hasScope: boolean = expectedScopes?.some(expectedScope =>
        application?.roles?.some(role =>
            role.scopes?.some(scope => scope.name.toLowerCase() === expectedScope.toLowerCase()),
        ),
    );

    return hasScope || router.navigate(['unauthorized']);
};
