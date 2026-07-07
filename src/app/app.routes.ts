import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { SystemRole } from './core/enums/app.enums';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
        canActivate: [loginGuard]
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'employees',
        loadComponent: () => import('./features/employees/employee-list.component').then(m => m.EmployeeListComponent),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER, SystemRole.ONBOARDING_MANAGER
        ])]
    },
    {
        path: 'employees/onboard',
        loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER, SystemRole.ONBOARDING_MANAGER
        ])]
    },
    {
        path: 'employees/onboard/:id',
        loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER, SystemRole.ONBOARDING_MANAGER
        ])]
    },
    {
        path: 'employees/:id',
        loadComponent: () => import('./features/employees/employee-detail.component').then(m => m.EmployeeDetailComponent),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER, SystemRole.ONBOARDING_MANAGER
        ])]
    },
    {
        path: 'departments',
        loadComponent: () => import('./features/departments/department-list.component').then(m => m.DepartmentListComponent),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER
        ])]
    },
    {
        path: 'teams',
        loadComponent: () => import('./features/teams/team-list.component').then(m => m.TeamListComponent),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER
        ])]
    },
    {
        path: 'branches',
        loadComponent: () => import('./features/locations/location-list.component').then(m => m.LocationListComponent),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER
        ])]
    },
    {
        path: 'holidays',
        loadComponent: () => import('./features/holidays/holiday-list.component').then(m => m.HolidayListComponent),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER
        ])]
    },
    {
        path: 'leave/types',
        loadComponent: () => import('./features/leave/leave-types.component').then(m => m.LeaveTypesComponent),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER
        ])]
    },
    {
        path: 'leave/requests',
        loadComponent: () => import('./features/leave/leave-requests.component').then(m => m.LeaveRequestsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'leave/approvals',
        loadComponent: () => import('./features/leave/leave-approvals.component').then(m => m.LeaveApprovalsComponent),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER, SystemRole.BRANCH_MANAGER
        ])]
    },
    {
        path: 'attendance',
        loadComponent: () => import('./features/attendance/attendance.component').then(m => m.AttendanceComponent),
        canActivate: [authGuard]
    },
    {
        path: 'attendance-logs',
        loadComponent: () => import('./features/attendance/employee-attendance.component').then(m => m.EmployeeAttendanceComponent),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER, SystemRole.BRANCH_MANAGER
        ])]
    },
    {
        path: 'shifts',
        loadComponent: () => import('./features/shifts/shift-list.component').then(m => m.ShiftListComponent),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER
        ])]
    },
    {
        path: 'payroll',
        loadComponent: () => import('./features/payroll/payroll.component').then(m => m.PayrollComponent),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER, SystemRole.PAYROLL_MANAGER
        ])]
    },
    {
        path: 'payroll/revisions',
        loadComponent: () => import('./features/compensation/compensation.component').then(m => m.CompensationComponent),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER, SystemRole.PAYROLL_MANAGER
        ])]
    },
    {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
        canActivate: [authGuard, roleGuard([
            SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER
        ])]
    },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: 'dashboard' }
];
