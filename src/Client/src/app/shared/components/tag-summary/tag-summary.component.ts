import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { SortPipe } from 'app/shared/pipes';
import { trackByFn } from 'app/shared/shared.utils';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { getContrastYIQ, Tag } from 'app/modules/configuration/tags/tag.types';
import { TagSummaryViewMode } from './tag-summary.types';

@UntilDestroy()
@Component({
    selector: 'tag-summary',
    templateUrl: './tag-summary.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgFor, NgIf, NgStyle, SortPipe, MatIconModule, MatTooltipModule, TranslocoModule],
})
export class TagSummaryComponent implements OnInit {
    @Input() tags: Tag[] = [];
    @Input() viewMode: TagSummaryViewMode = 'mini';

    getContrastYIQ = getContrastYIQ;
    trackByFn = trackByFn;

    activeLang: string;

    constructor(private _translocoService: TranslocoService) {}

    ngOnInit(): void {
        this.activeLang = this._translocoService.getActiveLang();

        // Subscribe to language changes
        this._translocoService.langChanges$.pipe(untilDestroyed(this)).subscribe(activeLang => {
            // Get the active lang
            this.activeLang = activeLang;
        });
    }
}
