import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseEntityService } from 'app/shared/services';
import { Bookmark } from './bookmark.types';

@Injectable({ providedIn: 'root' })
export class BookmarkService extends BaseEntityService<Bookmark> {
    constructor(http: HttpClient) {
        super(http);
        this.defaultApiController = 'Bookmarks';
    }
}
