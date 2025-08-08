import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();
    console.log(token)
    let authReq = req;
    console.log('req.url', req.url);
    console.log('apiUrl', environment.apiUrl);

    if (token && !req.url.includes('/auth/refresh-token') && req.url.startsWith(environment.apiUrl)) {
      console.log('Adding Authorization header for:', req.url, 'Token:', token);
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    } else {
      console.log('Skipping Authorization header for:', req.url, 'Token:', token);
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
          console.log('401 error detected for:', req.url, 'Attempting token refresh');
          return this.handle401Error(authReq, next);
        }
        console.error('HTTP error:', error);
        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap(({ accessToken }) => {
        console.log('Token refreshed, new token:', accessToken);
        const clonedReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
        });
        return next.handle(clonedReq);
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        this.authService.clearSession();
        return throwError(() => error);
      })
    );
  }
}