import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, shareReplay, tap, timeout } from 'rxjs/operators';
import { GithubUser } from '../../models/github-user';

@Injectable({ providedIn: 'root' })
export class GithubService {
  private apiUrl = 'https://api.github.com/users';
  private cache = new Map<string, GithubUser>();
  private inFlight = new Map<string, Observable<GithubUser>>();

  constructor(private http: HttpClient) {}

  getUser(username: string): Observable<GithubUser> {
    const key = username.trim();

    if (this.cache.has(key)) {
      return of(this.cache.get(key)!);
    }

    if (this.inFlight.has(key)) {
      return this.inFlight.get(key)!;
    }

    const request$ = this.http.get<GithubUser>(`${this.apiUrl}/${key}`).pipe(
      timeout(8000),
      tap((user) => {
        this.cache.set(key, user);
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => {
        this.inFlight.delete(key);
      }),
      shareReplay(1)
    );

    this.inFlight.set(key, request$);
    return request$;
  }
}