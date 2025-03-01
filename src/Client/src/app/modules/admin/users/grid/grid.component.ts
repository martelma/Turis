import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule } from '@ngneat/transloco';
import { MaterialModule } from 'app/modules/material.module';
import { trackByFn } from 'app/shared/utils';
import { User } from 'app/core/user/user.types';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-user-grid',
    standalone: true,
    templateUrl: './grid.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, MaterialModule, TranslocoModule],
})
export class UserGridComponent {
    @Input() items: User[] = [];
    @Input() userId: string;

    @Output() itemClicked = new EventEmitter<User>();

    trackByFn = trackByFn;

    onItemClicked(item: User): void {
        this.itemClicked.emit(item);
    }
}
