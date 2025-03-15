import { Collaborator } from 'app/modules/service/service.types';

export class JournalEntrySummary {
    yearData: SummaryData;
    monthData: SummaryData;
    weekData: SummaryData;
}

export class SummaryData {
    data: DataItem[] = [];
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

export class DataItem {
    viewOrder: number;
    label: string;
    income: number;
    expense: number;
    balance: number;
}

export class ContactSummary {
    years: ContactSummaryData[];
}

export class ContactSummaryData {
    viewOrder: number;
    label: string;
    total: number;
    payed: number;
    data: ContactDataItem[] = [];
}

export class ContactDataItem {
    viewOrder: number;
    label: string;
    value: number;
    balance: number;
}

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
    members: TeamMember[] = [];
}

export class TeamMember {
    collaborator: Collaborator;
}
