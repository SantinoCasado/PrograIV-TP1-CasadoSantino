import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, timeout } from 'rxjs/operators';
import { GithubUser } from '../../models/github-user';

@Injectable({ providedIn: 'root' })
export class GithubService {
  private apiUrl = 'https://api.github.com/users';
  private cache = new Map<string, Observable<GithubUser>>();

  constructor(private http: HttpClient) {}

  getUser(username: string): Observable<GithubUser> {
    const key = username.trim();

    if (!this.cache.has(key)) {
      const request$ = this.http.get<GithubUser>(`${this.apiUrl}/${key}`).pipe(
        timeout(8000),
        catchError((err) => {
          this.cache.delete(key);
          return throwError(() => err);
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );

      this.cache.set(key, request$);
    }

    return this.cache.get(key)!;
  }
}