import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { SortPipe } from 'app/shared/pipes';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { years } from 'app/shared/shared.utils';
import { FormsModule } from '@angular/forms';

@UntilDestroy()
@Component({
    selector: 'years-toggle',
    templateUrl: './years-toggle.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgFor,
        NgIf,
        NgStyle,
        SortPipe,
        FormsModule,
        MatIconModule,
        MatTooltipModule,
        MatButtonToggleModule,
        TranslocoModule,
    ],
})
export class YearsToggleComponent implements OnInit {
    @Input() number = 5;
    @Input() currentYear: number = new Date().getFullYear();

    @Output() yearChange: EventEmitter<number> = new EventEmitter<number>();

    years: number[] = [];

    constructor(private _translocoService: TranslocoService) {
        this.years = years(5);
    }

    ngOnInit(): void {}

    onToggleChange(event: MatButtonToggleChange): void {
        this.yearChange.emit(event.value);
    }
}
