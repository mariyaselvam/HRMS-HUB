import { SystemRole } from '../enums/app.enums';

/**
 * Normalizes a role string for comparison.
 */
export function normalizeRole(role: string): string {
    return role
        .toLowerCase()
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// All known role display names from the SystemRole enum
const KNOWN_ROLES: string[] = [];
for (const v of Object.values(SystemRole)) {
    if (typeof v === 'string') KNOWN_ROLES.push(v);
}

// Short code aliases → maps to actual SystemRole values
// This allows templates to use: hasRole('admin') instead of hasRole('Company Admin')
const ROLE_ALIASES: Record<string, SystemRole[]> = {
    // 'admin': [SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN],
    'super_admin': [SystemRole.SUPER_ADMIN],
    'company_admin': [SystemRole.COMPANY_ADMIN],
    'hr_manager': [SystemRole.HR_MANAGER],
    'payroll_manager': [SystemRole.PAYROLL_MANAGER],
    'onboarding_manager': [SystemRole.ONBOARDING_MANAGER],
    'branch_manager': [SystemRole.BRANCH_MANAGER],
    'manager': [SystemRole.HR_MANAGER, SystemRole.PAYROLL_MANAGER, SystemRole.ONBOARDING_MANAGER, SystemRole.BRANCH_MANAGER],
    'employee': [SystemRole.EMPLOYEE],
};

/**
 * Checks if the user has one of the allowed roles.
 * Accepts both full role names ("Company Admin") and short codes ("admin", "super_admin").
 */
export function hasRole(userRole: string, allowedRoles: SystemRole[]): boolean {
    if (!userRole || !allowedRoles.length) return false;

    const normalizedUserRole = normalizeRole(userRole);

    // 1. Check if userRole matches any allowed role directly
    for (const allowed of allowedRoles) {
        if (allowed === userRole) return true;
        if (normalizeRole(allowed) === normalizedUserRole) return true;
    }

    // 2. Check if userRole matches any known SystemRole
    let matchedUserRole: SystemRole | null = null;
    for (const knownRole of KNOWN_ROLES) {
        if (normalizeRole(knownRole) === normalizedUserRole) {
            matchedUserRole = knownRole as SystemRole;
            break;
        }
    }

    // If we found the user's actual role, check if it's in allowedRoles
    if (matchedUserRole && allowedRoles.includes(matchedUserRole)) {
        return true;
    }

    // 3. Check aliases: if userRole is a short code, expand it
    const aliasesForUser = ROLE_ALIASES[normalizedUserRole];
    if (aliasesForUser) {
        for (const aliasedRole of aliasesForUser) {
            if (allowedRoles.includes(aliasedRole)) {
                return true;
            }
        }
    }

    // 4. Check if any allowed role is a short code that matches the user's role
    for (const allowed of allowedRoles) {
        const normalizedAllowed = normalizeRole(allowed);
        const aliasesForAllowed = ROLE_ALIASES[normalizedAllowed];
        if (aliasesForAllowed && matchedUserRole && aliasesForAllowed.includes(matchedUserRole)) {
            return true;
        }
    }

    return false;
}

/**
 * Gets the canonical display name for a role from any input format.
 */
export function getRoleDisplayName(role: string): string {
    if (!role) return role;
    const normalized = normalizeRole(role);
    for (const knownRole of KNOWN_ROLES) {
        if (normalizeRole(knownRole) === normalized) {
            return knownRole;
        }
    }
    return role;
}