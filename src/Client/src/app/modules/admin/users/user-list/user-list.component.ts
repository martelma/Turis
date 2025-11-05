import { NgIf, NgFor, NgClass } from '@angular/common';
import {
    Component,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    OnInit,
    Input,
    EventEmitter,
    Output,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { TranslocoModule } from '@jsverse/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { trackByFn } from 'app/shared/utils';
import { BaseSearchParameters } from 'app/shared/types/shared.types';
import { User } from 'app/core/user/user.types';
import { UserGridComponent } from '../grid/grid.component';
import { ViewMode } from 'app/shared/components/view-mode-selector/view-mode-selector.types';
import { UsersService } from '../users.service';

@UntilDestroy()
@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        TranslocoModule,
        UserGridComponent,
    ],
})
export class UserListComponent implements OnInit {
    @Input() users: User[];
    @Input() viewMode: ViewMode = 'table';
    @Input() queryParameters: BaseSearchParameters;

    @Output() userSelected: EventEmitter<User> = new EventEmitter<User>();

    userId: string;

    columns = ['index', 'avatar', 'fullName', 'email', 'userName'];

    trackByFn = trackByFn;

    constructor(private _usersService: UsersService) {}

    ngOnInit(): void {
        this._usersService.user$.pipe(untilDestroyed(this)).subscribe(user => {
            this.userId = user?.id;
        });
    }

    onUserClicked(user: User): void {
        this.userSelected.emit(user);
    }
}
