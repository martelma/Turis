import { BaseSearchParameters } from 'app/shared/types/shared.types';

export class Attachment {
    id: string;
    // user: User;
    entityName: AttachmentName;
    entityKey: string;
    timeStamp: Date;
    originalFileName: string;
    folder: string;
    type: string;
    note: string;
}

export class AttachmentSearchParameters extends BaseSearchParameters {
    pattern?: string;
    onlyBookmarks?: boolean;
    entityName?: string;
    entityKey?: string;
    folder?: string;
    type?: string;
}

export type AttachmentName = 'Service' | 'Contact';
