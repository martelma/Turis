import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Document, DocumentSearchParameters } from '../document/document.types';
import { BaseEntityService } from 'app/shared/services';
import { BehaviorSubject, filter, finalize, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { emptyGuid, PaginatedListResult } from 'app/shared/services/shared.types';

@Injectable({ providedIn: 'root' })
export class DocumentService extends BaseEntityService<Document> {
    private _documents: BehaviorSubject<PaginatedListResult<Document>> = new BehaviorSubject(null);
    private _document: BehaviorSubject<Document> = new BehaviorSubject(null);
    private _documentEdited: BehaviorSubject<string> = new BehaviorSubject(null);
    private _documentsLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _queryParameters: BehaviorSubject<DocumentSearchParameters> = new BehaviorSubject({
        length: 0,
        pageIndex: 0,
        pageSize: 10,
    });
    constructor(http: HttpClient) {
        super(http);
        this.defaultApiController = 'document';
    }

    /**
     * Getter for documents
     */
    get documents$(): Observable<PaginatedListResult<Document>> {
        return this._documents.asObservable();
    }

    /**
     * Getter for document
     */
    get document$(): Observable<Document> {
        return this._document.asObservable();
    }

    /**
     * Getter for documents loading
     */
    get documentsLoading$(): Observable<boolean> {
        return this._documentsLoading.asObservable();
    }

    /**
     * Getter for document edited
     */
    get documentEdited$(): Observable<string> {
        return this._documentEdited.asObservable();
    }

    /**
     * Getter for query parameters
     */
    get documentParameters$(): Observable<DocumentSearchParameters> {
        return this._queryParameters.asObservable();
    }

    /**
     * Get a document identified by the given document id
     */
    getById(id: string): Observable<Document> {
        return this.getSingle(id).pipe(
            map(document => {
                this._document.next(document);

                return document;
            }),
        );
    }

    /**
     * Create a dummy document
     */
    createEntity(): Observable<Document> {
        return this.documents$.pipe(
            take(1),
            switchMap(documents =>
                of({
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
                    items: [],
                }).pipe(
                    map(newDocument => {
                        // Update the documents with the new document
                        this._documents.next({ ...documents, items: [newDocument, ...documents.items] });

                        // Return the new document
                        return newDocument;
                    }),
                ),
            ),
        );
    }

    /**
     * Update document
     *
     * @param id
     * @param document
     */
    updateEntity(id: string, document: Document): Observable<Document> {
        return this.documents$.pipe(
            take(1),
            switchMap(documents =>
                this.create(document).pipe(
                    map(() => {
                        // Find the index of the updated document
                        const index = documents.items.findIndex(item => item.id === id);

                        // Update the document
                        documents[index] = document;

                        // Update the document
                        this._document.next(document);

                        // Return the updated document
                        return document;
                    }),
                    switchMap(updatedDocument =>
                        this.document$.pipe(
                            take(1),
                            filter(item => item && item.id === id),
                            tap(() => {
                                // Update the document if it's selected
                                this._document.next(updatedDocument);

                                // Return the updated document
                                return updatedDocument;
                            }),
                        ),
                    ),
                ),
            ),
        );
    }

    /**
     * Gets all documents
     * @returns
     */
    listEntities(params?: DocumentSearchParameters): Observable<PaginatedListResult<Document>> {
        this._documentsLoading.next(true);

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
                this._documents.next(list);

                this._queryParameters.next({
                    ...this._queryParameters,
                    ...params,
                    pageIndex: list.pageIndex,
                    pageSize: list.pageSize,
                });

                return list;
            }),
            finalize(() => {
                this._documentsLoading.next(false);
            }),
        );
    }

    /**
     * Delete the document identified by the given id
     * @param id
     * @returns
     */
    deleteEntity(id: string): Observable<Document> {
        return this._documents.pipe(
            take(1),
            switchMap(documents => {
                // Remove the document
                this._document.next(null);

                // Remove the document from the _documents
                this._documents.next({ ...documents, items: documents.items.filter(item => item.id !== id) });

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

    editDocument(documentId: string): void {
        this._documentEdited.next(documentId);
    }
}
