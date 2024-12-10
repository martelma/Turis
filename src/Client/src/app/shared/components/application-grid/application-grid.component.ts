import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule } from '@ngneat/transloco';
import { MaterialModule } from 'app/modules/material.module';
import { ApplicationGridItemClickEvent } from './application-grid.types';
import { trackByFn } from 'app/shared/utils';
import { Application } from 'app/modules/admin/applications/applications.types';

@Component({
    selector: 'app-application-grid',
    standalone: true,
    templateUrl: './application-grid.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, TranslocoModule],
})
export class ApplicationGridComponent {
    @Input() items: Application[] = [];
    @Input() withActionButtons = true;
    @Input() withEffects = true;

    @Output() itemClicked = new EventEmitter<ApplicationGridItemClickEvent>();
    @Output() actionClicked = new EventEmitter<ApplicationGridItemClickEvent>();

    public subMenuItem: any;

    trackByFn = trackByFn;

    hide(event: any): void {
        // Hide html element
        event.target.classList.toggle('hidden');
    }

    getItemImageUrl(): string {
        return './assets/images/background.jpg';
    }

    onItemClicked(item: Application): void {
        this.itemClicked.emit({
            item,
            noBlank: false,
        });
    }

    onActionClicked(item: Application, noBlank: boolean): void {
        this.actionClicked.emit({
            item,
            noBlank,
        });
    }

    hashCode(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }

    intToRGB(i: number): string {
        const c = (i & 0x00ffffff).toString(16).toUpperCase();

        return '#' + '00000'.substring(0, 6 - c.length) + c;
    }

    isHover(any: any): boolean {
        return this.subMenuItem && this.subMenuItem === any;
    }

    generateClass(name: string): string {
        return `background-color: ${this.intToRGB(this.hashCode(name))}`;
    }

    showSubmenu(any: any): void {
        this.subMenuItem = any;
    }

    hideSubmenu(): void {
        this.subMenuItem = null;
    }
}
