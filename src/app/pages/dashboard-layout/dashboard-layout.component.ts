// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-dashboard-layout',
//   imports: [],
//   templateUrl: './dashboard-layout.component.html',
//   styleUrl: './dashboard-layout.component.css'
// })
// export class DashboardLayoutComponent {

// }
import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface SidebarItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard-layout.component.html'
})
export class DashboardLayoutComponent {

}
