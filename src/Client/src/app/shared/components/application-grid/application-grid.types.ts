import { Application } from 'app/modules/admin/applications/applications.types';

export interface ApplicationGridItemClickEvent {
    item: Application;
    noBlank: boolean;
}
