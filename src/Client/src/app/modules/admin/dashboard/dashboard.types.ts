import { expandCollapse } from '@fuse/animations/expand-collapse';
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

export class AnnualStat {
    year: number;
    total: number;
}

export class LanguageStat {
    languageCode: string;
    count: number;
}

export class TypeStat {
    serviceType: string;
    durationType: string;
    count: number;
}

export class TagStat {
    tagName: string;
    count: number;
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

    annualStats: AnnualStat[] = [];
    languageStats: LanguageStat[] = [];
    typeStats: TypeStat[] = [];
    tagStats: TagStat[] = [];
}

export class TeamSummary {
    forEach(arg0: (item: any) => void) {
        throw new Error('Method not implemented.');
    }
    members: TeamMember[] = [];
}

export class CommissionStat {
    collaboratorId: string;
    firstName: string;
    lastName: string;
    year: number;
    month: number;
    amountMin: number;
    amountMax: number;
    percentageMin: number;
    percentageMax: number;
    commission: number;
    total: number;
    percentage: number;
}

export class TeamMember {
    collaborator: Collaborator;
    commissionStat: CommissionStat[] = [];
    commission: number;
    total: number;
    percentage: number;
    chartOptions: any;
    dataSource: any;
}
