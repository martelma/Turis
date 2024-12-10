import { FuseNavigationItem } from '@fuse/components/navigation';
import { User } from 'app/core/user/user.types';
import { environment } from 'environments/environment';
import { Roles } from '../user/user.roles';

export const isItemVisibleForUser = (user: User, item: FuseNavigationItem): boolean => {
    const workspaceApp = user?.applications.find(a => a.id.toLowerCase() === environment.applicationId.toLowerCase());

    // Owner always can see the item
    if (workspaceApp?.roles?.some(x => x.name.toLowerCase() === Roles.OWNER.toLowerCase())) {
        return true;
    }

    // Administrator always can see the item
    if (workspaceApp?.roles?.some(x => x.name.toLowerCase() === Roles.ADMINISTRATOR.toLowerCase())) {
        return true;
    }

    // If the item has no specific scopes it can be displayed
    if (!item?.scopes) {
        // If the item has no specific roles it can be displayed
        if (!item?.roles) {
            return true;
        }

        // Otherwise, checks whether the user has the specific role
        return item?.roles?.some(role =>
            workspaceApp?.roles.some(appRole => appRole.name.toLowerCase() === role.toLowerCase()),
        );
    }

    // Otherwise, checks whether the user has the specific scope
    return item?.scopes?.some(scope =>
        workspaceApp?.roles.some(appRole =>
            appRole.scopes.some(appScope => appScope.name.toLowerCase() === scope.toLowerCase()),
        ),
    );
};
