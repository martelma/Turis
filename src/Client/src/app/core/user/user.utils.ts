import { Roles } from './user.roles';
import { User } from './user.types';

export const isUserOwner = (user: User): boolean => {
    const workspaceApp = user?.applications.find(r => r.id.toLowerCase() === environment.applicationId.toLowerCase());

    return workspaceApp?.roles?.some(r => r.name.toLowerCase() === Roles.OWNER.toLowerCase()) ?? false;
};

export const isAdministrator = (user: User): boolean => {
    if (isUserOwner(user)) {
        return true;
    }

    return userInRole(user, Roles.ADMINISTRATOR);
};

export const userHasScope = (user: User, scope: string): boolean => {
    if (isAdministrator(user)) {
        return true;
    }

    const workspaceApp = user?.applications.find(a => a.id.toLowerCase() === environment.applicationId.toLowerCase());
    return workspaceApp?.roles?.some(r => r.scopes.some(s => s.name.toLowerCase() === scope.toLowerCase())) ?? false;
};

export const userInRole = (user: User, role: string): boolean => {
    if (isAdministrator(user)) {
        return true;
    }

    const workspaceApp = user?.applications.find(r => r.id.toLowerCase() === environment.applicationId.toLowerCase());

    return workspaceApp?.roles?.some(r => r.name.toLowerCase() === role.toLowerCase()) ?? false;
};
