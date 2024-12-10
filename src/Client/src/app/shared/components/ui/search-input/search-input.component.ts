import { NgClass, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation,
    OnInit,
} from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, map } from 'rxjs';

@UntilDestroy()
@Component({
    selector: 'app-search-input',
    templateUrl: './search-input.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NgClass, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, TranslocoModule],
})
export class SearchInputComponent implements OnInit {
    @Input() debounce = 500;
    @Input() label?: string;
    @Input() placeholder = 'General.Filter';
    @Input() parentFormGroup: UntypedFormGroup;
    @Input() controlName = 'searchText';

    @Output() callbackFn: EventEmitter<string> = new EventEmitter();

    searchInputControl: UntypedFormControl = new UntypedFormControl();

    ngOnInit(): void {
        // Subscribe to the search field value changes
        this.searchInputControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                map(value => value),
                untilDestroyed(this),
            )
            .subscribe(() => {
                this.filter();
            });

        this.parentFormGroup?.addControl(this.controlName, this.searchInputControl);
    }

    filter(): void {
        this.callbackFn.emit(this.searchInputControl.value);
    }
}
