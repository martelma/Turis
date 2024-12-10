import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from 'app/layout/common/messages/messages.types';
import { map, Observable, ReplaySubject, switchMap, take, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessagesService {
    private _messages: ReplaySubject<Message[]> = new ReplaySubject<Message[]>(1);

    constructor(private _httpClient: HttpClient) {}

    get messages$(): Observable<Message[]> {
        return this._messages.asObservable();
    }

    getAll(): Observable<Message[]> {
        return this._httpClient.get<Message[]>('api/common/messages').pipe(
            tap(messages => {
                this._messages.next(messages);
            }),
        );
    }

    create(message: Message): Observable<Message> {
        return this.messages$.pipe(
            take(1),
            switchMap(messages =>
                this._httpClient.post<Message>('api/common/messages', { message }).pipe(
                    map(newMessage => {
                        // Update the messages with the new message
                        this._messages.next([...messages, newMessage]);

                        // Return the new message from observable
                        return newMessage;
                    }),
                ),
            ),
        );
    }

    update(id: string, message: Message): Observable<Message> {
        return this.messages$.pipe(
            take(1),
            switchMap(messages =>
                this._httpClient
                    .patch<Message>('api/common/messages', {
                        id,
                        message,
                    })
                    .pipe(
                        map((updatedMessage: Message) => {
                            // Find the index of the updated message
                            const index = messages.findIndex(item => item.id === id);

                            // Update the message
                            messages[index] = updatedMessage;

                            // Update the messages
                            this._messages.next(messages);

                            // Return the updated message
                            return updatedMessage;
                        }),
                    ),
            ),
        );
    }

    delete(id: string): Observable<boolean> {
        return this.messages$.pipe(
            take(1),
            switchMap(messages =>
                this._httpClient.delete<boolean>('api/common/messages', { params: { id } }).pipe(
                    map((isDeleted: boolean) => {
                        // Find the index of the deleted message
                        const index = messages.findIndex(item => item.id === id);

                        // Delete the message
                        messages.splice(index, 1);

                        // Update the messages
                        this._messages.next(messages);

                        // Return the deleted status
                        return isDeleted;
                    }),
                ),
            ),
        );
    }

    markAllAsRead(): Observable<boolean> {
        return this.messages$.pipe(
            take(1),
            switchMap(messages =>
                this._httpClient.get<boolean>('api/common/messages/mark-all-as-read').pipe(
                    map((isUpdated: boolean) => {
                        // Go through all messages and set them as read
                        messages.forEach((message, index) => {
                            messages[index].read = true;
                        });

                        // Update the messages
                        this._messages.next(messages);

                        // Return the updated status
                        return isUpdated;
                    }),
                ),
            ),
        );
    }
}
