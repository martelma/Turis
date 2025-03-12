import { Collaborator } from 'app/modules/service/service.types';

export class ServiceSummary {
    proposals: number;
    weekProposals: number;
    checked: number;
    checkedToAssign: number;
    toDo: number;
    weekToDo: number;
    done: number;
    weekDone: number;
}

export class TeamSummary {
    members: Collaborator[] = [];
}
