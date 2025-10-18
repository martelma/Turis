import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { GlobalShortcutsService } from './global-shortcuts.service';

@Component({
    selector: 'app-global-shortcuts',
    templateUrl: './global-shortcuts.component.html',
    styleUrls: [],
    standalone: true,
    imports: [KeyboardShortcutsModule, CommonModule],
})
export class GlobalShortcutsComponent {
    constructor(public globalShortcutsService: GlobalShortcutsService) {}
}
