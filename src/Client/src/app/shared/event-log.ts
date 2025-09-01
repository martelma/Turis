import { User } from 'app/core/user/user.types';

export class EventLog {
    id: string;
    user: User;
    date: Date;
    timeStamp: Date;
    eventName: string;
    additionalInfo: string;
}
