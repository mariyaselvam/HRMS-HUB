import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { ContextStore } from '../../store/context.store';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const contextStore = inject(ContextStore);
    
    const token = authService.getToken();
    const activeBranchId = contextStore.activeBranchId();
    const activeClusterId = contextStore.activeClusterId();

    let headers = req.headers;
    if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (activeBranchId) {
        headers = headers.set('x-branch-id', activeBranchId);
    }

    if (activeClusterId) {
        headers = headers.set('x-cluster-id', activeClusterId);
    }

    const authReq = req.clone({ headers });

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                authService.logout();
            }
            return throwError(() => error);
        })
    );
};

