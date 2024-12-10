import { User } from 'app/core/user/user.types';

export interface BaseSearchParameters {
    pageIndex?: number;
    pageSize?: number;
    orderBy?: string;
}

export interface PaginatedListResult<T> {
    items: T[];

    pageIndex: number;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
}

export const defaultSearchParameters = { pageIndex: 0, pageSize: 10, totalCount: 0, hasNextPage: false, items: [] };

export interface AppConfig {
    languages: string[];
    enabledAmbiente: boolean;
}

export const appConfig: AppConfig = {
    languages: ['IT', 'EN', 'FR'],
    enabledAmbiente: true,
};

export interface DateFormats {
    date: string;
    dateTime: string;
    dateTimeWithSeconds: string;
    time: string;
    timeWithSeconds: string;
}

export const userDateFormats: DateFormats = {
    date: 'dd/MM/yyyy',
    dateTime: 'dd/MM/yyyy HH:mm',
    dateTimeWithSeconds: 'dd/MM/yyyy HH:mm:ss',
    time: 'HH:mm',
    timeWithSeconds: 'HH:mm:ss',
};

export const emptyGuid = '00000000-0000-0000-0000-000000000000';

export interface Bookmark {
    id: string;
    entityName: string;
    entityId: string;
    date: Date;
}

export interface Application {
    description?: string;
    icon?: string;
    id?: string;
    name?: string;
    roles?: ApplicationRole[];
    scopeGroups?: ApplicationScopeGroup[];
    url?: string;
    users?: User[];
}

export interface ApplicationRole {
    description?: string;
    id?: string;
    name?: string;
    scopes?: ApplicationScope[];
}

export interface ApplicationScope {
    applicationId?: string;
    id?: string;
    name?: string;
    description?: string;
    roleId?: string;
    scopeGroupId?: string;
    scopeGroupName?: string;
}

export interface ApplicationScopeGroup {
    id?: string;
    name?: string;
    description?: string;
    scopes?: ApplicationScope[];
}

export const toPascalCase = (s: string) =>
    s.replace(/(\w)(\w*)/g, function (g0, g1, g2) {
        return g1.toUpperCase() + g2.toLowerCase();
    });

export interface GenericResponse {
    correlationId: string;
    message: string;
    body: any;
}
