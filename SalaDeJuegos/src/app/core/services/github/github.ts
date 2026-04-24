import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

export interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  company: string;
  location: string;
  blog: string;
}

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  private baseUrl = 'https://api.github.com/users';

  constructor(private http: HttpClient) {}

  getUser(username: string): Observable<GitHubUser> {
    return this.http.get<GitHubUser>(`${this.baseUrl}/${username}`).pipe(
      timeout(8000),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }
}
