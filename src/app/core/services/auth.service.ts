import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthUser, LoginRequest, LoginResponse } from '../models/auth.model';
import { APP_CONFIG } from '../constants/app.constants';
import { hasRole } from '../utils/role.utils';
import { SystemRole } from '../enums/app.enums';

const TOKEN_KEY = 'hrms_token';
const USER_KEY = 'hrms_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private currentUser = signal<AuthUser | null>(this.loadUserFromStorage());
    private token = signal<string | null>(this.loadTokenFromStorage());

    readonly user = computed(() => this.currentUser());
    readonly isLoggedIn = computed(() => !!this.token());
    readonly userRole = computed(() => this.currentUser()?.role ?? '');

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http
            .post<LoginResponse>(`${APP_CONFIG.API_BASE_URL}/auth/login`, credentials)
            .pipe(
                tap((res) => {
                    this.token.set(res.data.token);
                    this.currentUser.set(res.data.user);
                    localStorage.setItem(TOKEN_KEY, res.data.token);
                    localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
                }),
                catchError((err) => throwError(() => err))
            );
    }

    logout(): void {
        this.token.set(null);
        this.currentUser.set(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return this.token();
    }

    hasRole(...roles: string[]): boolean {
        const userRole = this.userRole();
        return hasRole(userRole, roles as SystemRole[]);
    }

    private loadTokenFromStorage(): string | null {
        try { return localStorage.getItem(TOKEN_KEY); }
        catch { return null; }
    }

    private loadUserFromStorage(): AuthUser | null {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }
}
