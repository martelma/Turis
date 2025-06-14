import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Document, DocumentSearchParameters } from '../document/document.types';
import { BaseEntityService } from 'app/shared/services';
import { BehaviorSubject, filter, finalize, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';

@Injectable({ providedIn: 'root' })
export class DocumentService extends BaseEntityService<Document> {
    private _edited: BehaviorSubject<string> = new BehaviorSubject(null);
    private _list: BehaviorSubject<PaginatedListResult<Document>> = new BehaviorSubject(null);
    private _item: BehaviorSubject<Document> = new BehaviorSubject(null);
    private _loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _parameters: BehaviorSubject<DocumentSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });

    constructor(http: HttpClient) {
        super(http);
        this.defaultApiController = 'document';
    }

    get list$(): Observable<PaginatedListResult<Document>> {
        return this._list.asObservable();
    }

    get item$(): Observable<Document> {
        return this._item.asObservable();
    }

    get loading$(): Observable<boolean> {
        return this._loading.asObservable();
    }

    get edited$(): Observable<string> {
        return this._edited.asObservable();
    }

    get parameters$(): Observable<DocumentSearchParameters> {
        return this._parameters.asObservable();
    }

    getById(id: string): Observable<Document> {
        return this.getSingle(id).pipe(
            map(document => {
                this._item.next(document);

                return document;
            }),
        );
    }

    createEntity(): Observable<Document> {
        const item: Document = {
            id: emptyGuid,
            documentRefId: undefined,
            documentRef: undefined,
            type: undefined,
            status: undefined,
            clientId: undefined,
            client: undefined,
            idSdi: undefined,
            date: undefined,
            sectional: undefined,
            number: undefined,
            discountPercentage: undefined,
            discount: undefined,
            amount: undefined,
            vatRate: undefined,
            vat: undefined,
            aliquotaRitenutaDiAcconto: undefined,
            ritenutaDiAcconto: undefined,
            totalExemptExpenses: undefined,
            totalExpenses: undefined,
            total: undefined,
            importoBollo: undefined,
            desTipoPagamento: undefined,
            saldato: undefined,
            dataIncasso: undefined,
            collaboratorId: undefined,
            collaborator: undefined,
            sdiCodiceTipoPagamento: undefined,
            sdiValoreTipoPagamento: undefined,
            sdiCodiceCondizionePagamento: undefined,
            dataScadenzaPagamento: undefined,
            idDocumento: undefined,
            cig: undefined,
            cup: undefined,
            bookmarkId: undefined,
            selected: false,
            items: [],
        };

        this._item.next(item);

        return of(item);
    }

    updateEntity(id: string, document: Document): Observable<Document> {
        return this.list$.pipe(
            take(1),
            switchMap(documents =>
                this.create(document).pipe(
                    map(() => {
                        // Find the index of the updated document
                        const index = documents.items.findIndex(item => item.id === id);

                        // Update the document
                        documents[index] = document;

                        // Update the document
                        this._item.next(document);

                        // Return the updated document
                        return document;
                    }),
                    switchMap(updatedDocument =>
                        this.item$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the document if it's selected
                                this._item.next(updatedDocument);

                                // Return the updated document
                                return updatedDocument;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    listEntities(params?: DocumentSearchParameters): Observable<PaginatedListResult<Document>> {
        this._loading.next(true);

        let httpParams = new HttpParams();
        httpParams = httpParams.append('pageIndex', params?.pageIndex ?? 0);
        httpParams = httpParams.append('pageSize', params?.pageSize ?? 10);
        httpParams = httpParams.append('orderBy', params?.orderBy?.toString() ?? '');
        httpParams = httpParams.append('pattern', params?.pattern ?? '');
        httpParams = httpParams.append('onlyBookmarks', params?.onlyBookmarks ? 'true' : 'false');
        httpParams = httpParams.append('documentType', params?.documentType ?? '');
        httpParams = httpParams.append('sectional', params?.sectional ?? '');
        httpParams = httpParams.append('numberFrom', params?.numberFrom ?? 0);
        httpParams = httpParams.append('numberTo', params?.numberTo ?? 0);
        httpParams = httpParams.append('dateFrom', params?.dateFrom ?? '');
        httpParams = httpParams.append('dateTo', params?.dateTo ?? '');
        const queryString = httpParams.toString();

        const url = `?${queryString}`;

        return this.apiGet<PaginatedListResult<Document>>(url).pipe(
            map((list: PaginatedListResult<Document>) => {
                this._list.next(list);

                this._parameters.next({
                    ...this._parameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._loading.next(false);
            }),
        );
    }

    deleteEntity(id: string): Observable<Document> {
        return this._list.pipe(
            take(1),
            switchMap(documents => {
                // Remove the document
                this._item.next(null);

                // Remove the document from the _documents
                this._list.next({ ...documents, items: documents.items.filter(item => item.id !== id) });

                // Return the document
                return this.delete(id);
            }),
            switchMap(document => {
                if (!document) {
                    return throwError('Could not found document with id of ' + id + '!');
                }

                return of(document);
            }),
        );
    }

    editEntity(id: string): void {
        this._edited.next(id);
    }
}
