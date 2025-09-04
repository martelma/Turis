import { User } from 'app/core/user/user.types';
import { BaseSearchParameters } from './types/shared.types';

export class EventLog {
    id: string;
    user: User;
    date: Date;
    timeStamp: Date;
    eventName: string;
    additionalInfo: string;
}

export class EventLogSearchParameters extends BaseSearchParameters {
    entityName?: string;
    entityKey?: string;
    pattern?: string;
}
