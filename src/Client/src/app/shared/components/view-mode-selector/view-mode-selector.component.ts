import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ViewMode } from './view-mode-selector.types';

@Component({
    selector: 'app-view-mode-selector',
    templateUrl: './view-mode-selector.component.html',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, MatButtonToggleModule, MatIconModule],
})
export class ViewModeSelectorComponent {
    @Input() viewMode: ViewMode;
    @Output() changed = new EventEmitter<ViewMode>();

    onChanged() {
        this.changed.emit(this.viewMode);
    }
}
