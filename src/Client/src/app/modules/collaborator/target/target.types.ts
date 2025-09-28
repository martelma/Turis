import { Collaborator } from 'app/modules/service/service.types';
import { BaseSearchParameters } from 'app/shared/types/shared.types';

export class Target {
    id: string;

    collaboratorId: string;
    collaborator: Collaborator;

    year: number;
    month: number;
    amountMin: number;
    amountMax: number;
    percentageMin: number;
    percentageMax: number;

    edit = false;
    new = false;
}

export class TargetSearchParameters extends BaseSearchParameters {
    collaboratorId?: string;
    year?: number;
    month?: number;
    pattern?: string;
}
