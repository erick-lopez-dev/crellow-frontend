import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';

interface AuthResponse {
  id: string;
  name: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private userSubject = new BehaviorSubject<AuthResponse | null>(null);
  user$ = this.userSubject.asObservable();
  private isRefreshing = false;

  constructor(private http: HttpClient, private router: Router) {
    const user = localStorage.getItem('user');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        map(response => {
          this.setSession(response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { name, email, password })
      .pipe(
        map(response => {
          this.setSession(response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, { refreshToken })
      .pipe(
        map(() => {
          this.clearSession();
          this.router.navigate(['/auth/login']);
        }),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    if (this.isRefreshing) {
      return new Observable(observer => {
        const subscription = this.user$.subscribe(user => {
          if (user) {
            observer.next({ accessToken: user.accessToken, refreshToken: user.refreshToken });
            observer.complete();
          }
        });
        return () => subscription.unsubscribe();
      });
    }

    this.isRefreshing = true;
    const refreshToken = this.getRefreshToken();
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/auth/refresh-token`, { refreshToken })
      .pipe(
        map(response => {
          const user = this.userSubject.value;
          if (user) {
            const updatedUser = { ...user, accessToken: response.accessToken, refreshToken: response.refreshToken };
            this.setSession(updatedUser);
          }
          this.isRefreshing = false;
          return response;
        }),
        catchError(error => {
          this.isRefreshing = false;
          this.clearSession();
          this.router.navigate(['/auth/login']);
          return throwError(() => error);
        })
      );
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('user', JSON.stringify(authResult));
    localStorage.setItem('accessToken', authResult.accessToken);
    localStorage.setItem('refreshToken', authResult.refreshToken);
    this.userSubject.next(authResult);
  }

  clearSession(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.userSubject.next(null);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An error occurred';
    if (error.status === 400) {
      message = error.error.message || 'Invalid input';
    } else if (error.status === 401) {
      message = 'Unauthorized';
    }
    return throwError(() => new Error(message));
  }
}