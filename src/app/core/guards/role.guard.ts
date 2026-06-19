import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SystemRole } from '../enums/app.enums';
import { hasRole } from '../utils/role.utils';

/**
 * Role guard that checks if the user has one of the allowed roles.
 * Usage in routes:
 *   canActivate: [roleGuard(['Super Admin', 'Company Admin', 'HR Manager'])]
 */
export function roleGuard(allowedRoles: SystemRole[]): CanActivateFn {
    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        const userRole = authService.userRole();

        if (!userRole) {
            router.navigate(['/login']);
            return false;
        }

        if (!hasRole(userRole, allowedRoles)) {
            router.navigate(['/dashboard']);
            return false;
        }

        return true;
    };
}
