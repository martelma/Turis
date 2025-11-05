import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';

@Component({
    selector: 'app-spinner-button',
    templateUrl: './spinner-button.component.html',
    styleUrls: ['./spinner-button.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NgClass, MatButtonModule, MatProgressSpinnerModule, MatIconModule, TranslocoModule],
})
export class SpinnerButtonComponent {
    @Input() loading = false;
    @Input() disabled = false;
    @Input() color: ThemePalette = 'primary';
    @Input() diameter = 24;
    @Input() label = '';
    @Input() svgIcon: string;
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    @Input() style: 'flat' | 'raised' | 'stroked' = 'stroked';

    @Output() callbackFn: EventEmitter<void> = new EventEmitter();

    onClick(): void {
        this.callbackFn.emit();
    }
}
