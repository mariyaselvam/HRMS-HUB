import { Component, output, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SIDEBAR_NAV_ITEMS, SIDEBAR_APP_TITLE, SidebarNavItem } from '../../../core/constants/sidebar.constants';
import { inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { hasRole } from '../../../core/utils/role.utils';
import { SystemRole } from '../../../core/enums/app.enums';
@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
    authService = inject(AuthService);
    isMobileOpen = input<boolean>(false);
    isCollapsed = input<boolean>(false);
    readonly appTitle: string = SIDEBAR_APP_TITLE;
    readonly logo: string = '/logo1.png';

    readonly navItems = computed(() => {
        const userRole = this.authService.userRole();
        return SIDEBAR_NAV_ITEMS.filter(item =>
            !item.roles || hasRole(userRole, item.roles as SystemRole[])
        );
    });

    logout = output<void>();
    closeSidebar = output<void>();

    onLogout(): void {
        this.logout.emit();
    }

    onLinkClick(): void {
        this.closeSidebar.emit();
    }
}
