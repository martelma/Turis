import { A11yModule } from '@angular/cdk/a11y';
import { NgClass, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    Input,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
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
import { TranslocoModule } from '@ngneat/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';

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
    @Input() placeholder = 'Common.Filter';
    @Input() floatLabel: FloatLabelType = 'always';
    @Input() appearance: MatFormFieldAppearance = 'fill';
    @Input() subscriptingSizing: SubscriptSizing = 'dynamic';
    @Input() autocomplete = 'off';
    @Input() parentFormGroup: UntypedFormGroup;
    @Input() controlName = 'searchText';
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

    @ViewChild('searchInput') searchInput: ElementRef;

    private onChange: (val: boolean) => void;
    private onTouched: () => void;

    get value(): string {
        return this.searchInputControl.value;
    }

    ngOnInit(): void {
        this.parentFormGroup?.addControl(this.controlName, this.searchInputControl);
    }

    writeValue(value: any) {
        this.searchInputControl.setValue(value);
    }

    setDisabledState(disabled: boolean) {
        this.disabled = disabled;
    }

    registerOnChange(fn: any) {
        this.onChange = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    focusOnSearch(): any {
        this.searchInput.nativeElement.focus();
    }
}
