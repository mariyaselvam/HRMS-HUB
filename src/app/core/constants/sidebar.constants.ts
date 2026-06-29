import { SystemRole } from '../enums/app.enums';

export interface SidebarNavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
  roles?: string[];
}

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard', exact: true },

  // Admin & HR only
  {
    label: 'Employees',
    icon: 'pi pi-users',
    route: '/employees',
    roles: [
      SystemRole.SUPER_ADMIN,
      SystemRole.COMPANY_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.ONBOARDING_MANAGER,
    ],
  },
  {
    label: 'Departments',
    icon: 'pi pi-building',
    route: '/departments',
    roles: [SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER],
  },
  {
    label: 'Teams',
    icon: 'pi pi-sitemap',
    route: '/teams',
    roles: [SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER],
  },
  {
    label: 'Branches',
    icon: 'pi pi-map-marker',
    route: '/branches',
    roles: [SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER],
  },
  {
    label: 'Holidays',
    icon: 'pi pi-calendar',
    route: '/holidays',
    roles: [SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER],
  },

  // Leave (Everyone can view requests, managers can approve)
  { label: 'Leave Requests', icon: 'pi pi-calendar-plus', route: '/leave/requests' },
  {
    label: 'Leave Approvals',
    icon: 'pi pi-check-square',
    route: '/leave/approvals',
    roles: [
      SystemRole.SUPER_ADMIN,
      SystemRole.COMPANY_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.BRANCH_MANAGER,
    ],
  },
  {
    label: 'Leave Types',
    icon: 'pi pi-list',
    route: '/leave/types',
    roles: [SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER],
  },

  // Attendance
  { label: 'My Attendance', icon: 'pi pi-calendar', route: '/attendance' },
  {
    label: 'Attendance Logs',
    icon: 'pi pi-list-check',
    route: '/attendance-logs',
    roles: [
      SystemRole.SUPER_ADMIN,
      SystemRole.COMPANY_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.BRANCH_MANAGER,
    ],
  },
  {
    label: 'Shift Management',
    icon: 'pi pi-clock',
    route: '/shifts',
    roles: [
      SystemRole.SUPER_ADMIN,
      SystemRole.COMPANY_ADMIN,
      SystemRole.HR_MANAGER,
    ],
  },

  // Payroll (Admin, HR, Payroll Manager)
  {
    label: 'Payroll',
    icon: 'pi pi-money-bill',
    route: '/payroll',
    roles: [
      SystemRole.SUPER_ADMIN,
      SystemRole.COMPANY_ADMIN,
      SystemRole.HR_MANAGER,
      SystemRole.PAYROLL_MANAGER,
    ],
  },

  // Settings
  {
    label: 'Settings',
    icon: 'pi pi-cog',
    route: '/settings',
    roles: [SystemRole.SUPER_ADMIN, SystemRole.COMPANY_ADMIN, SystemRole.HR_MANAGER],
  },
];

export const SIDEBAR_APP_TITLE = 'HRMS Admin';
