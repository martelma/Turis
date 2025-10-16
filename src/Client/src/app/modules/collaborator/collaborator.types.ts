import { Contact } from '../contact/contact.types';

export interface CheckDataInfo {
    serviceId?: string;
    code: string;
    title: string;
    date: Date;
    dateText: string;
    serviceType?: string;
    durationType?: string;
    status?: string;
    clientId?: string;
    client: Contact;
    collaboratorId?: string;
    collaborator: Contact;
    workflowCollaboratorStatus?: string;
}

export class CollaboratorSearchParameters {
    pattern: string;
    pageIndex: number;
    pageSize: number;
    orderBy: string;
}

export class TeamSummaryParameters {
    year: number;
    pattern: string;
    pageIndex: number;
    pageSize: number;
    orderBy: string;
}
