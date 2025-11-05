import { A11yModule } from '@angular/cdk/a11y';
import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, Input, OnInit, ViewEncapsulation } from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    UntypedFormControl,
    UntypedFormGroup,
} from '@angular/forms';
import {
    FloatLabelType,
    MatFormFieldAppearance,
    MatFormFieldModule,
    SubscriptSizing,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@jsverse/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@UntilDestroy()
@Component({
    selector: 'app-search-input',
    templateUrl: './search-input.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchInputComponent),
            multi: true,
        },
    ],
    imports: [
        NgIf,
        NgClass,
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        TranslocoModule,
        A11yModule,
    ],
})
export class SearchInputComponent implements OnInit, ControlValueAccessor {
    @Input() searchInputControl: UntypedFormControl = new UntypedFormControl();

    @Input() debounce = 500;
    @Input() label?: string;
    @Input() placeholder = 'General.Filter';
    @Input() floatLabel: FloatLabelType = 'always';
    @Input() appearance: MatFormFieldAppearance = 'fill';
    @Input() subscriptingSizing: SubscriptSizing = 'dynamic';
    @Input() autocomplete = 'off';
    @Input() parentFormGroup: UntypedFormGroup;
    @Input() formControlName = 'searchText';
    @Input() inputClass:
        | string
        | string[]
        | Set<string>
        | {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              [klass: string]: any;
          }
        | null
        | undefined = 'fuse-mat-dense w-full';

    disabled: boolean;

    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    get value(): string {
        return this.searchInputControl.value;
    }

    ngOnInit(): void {
        // Add control to parent form group if provided
        if (this.parentFormGroup && this.formControlName) {
            this.parentFormGroup.addControl(this.formControlName, this.searchInputControl);
        }

        // Subscribe to value changes and notify parent form
        this.searchInputControl.valueChanges
            .pipe(debounceTime(this.debounce), distinctUntilChanged(), untilDestroyed(this))
            .subscribe(value => {
                this.onChange(value);
                this.onTouched();
            });
    }

    writeValue(value: any) {
        if (value !== this.searchInputControl.value) {
            this.searchInputControl.setValue(value, { emitEvent: false });
        }
    }

    setDisabledState(disabled: boolean) {
        this.disabled = disabled;
        if (disabled) {
            this.searchInputControl.disable();
        } else {
            this.searchInputControl.enable();
        }
    }

    registerOnChange(fn: any) {
        this.onChange = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }
}
