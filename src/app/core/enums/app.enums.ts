export enum ApiMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE'
}

export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    LATE = 'LATE',
    LEAVE = 'LEAVE'
}

/**
 * System roles that match the backend SystemRole enum.
 */
export enum SystemRole {
    SUPER_ADMIN = 'Super Admin',
    COMPANY_ADMIN = 'Company Admin',
    HR_MANAGER = 'HR Manager',
    PAYROLL_MANAGER = 'Payroll Manager',
    ONBOARDING_MANAGER = 'Onboarding Manager',
    BRANCH_MANAGER = 'Branch Manager',
    EMPLOYEE = 'Employee'
}

/**
 * Role groups for authorization checks.
 */
export const RoleGroups = {
    ADMIN: [SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN],
    HR: [SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER],
    PAYROLL: [SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.PAYROLL_MANAGER],
    ONBOARDING: [SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.ONBOARDING_MANAGER],
    BRANCH_MANAGER: [SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.BRANCH_MANAGER],
    ALL_MANAGERS: [
        SystemRole.SUPER_ADMIN,
        SystemRole.COMPANY_ADMIN,
        SystemRole.HR_MANAGER,
        SystemRole.PAYROLL_MANAGER,
        SystemRole.ONBOARDING_MANAGER,
        SystemRole.BRANCH_MANAGER
    ],
    ANY: Object.values(SystemRole)
};