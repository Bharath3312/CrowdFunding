import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  private themeService = inject(ThemeService);

  // Reactive theme state
  readonly isDarkMode = this.themeService.isDarkMode;

  // Footer data
  readonly currentYear = new Date().getFullYear();

  readonly footerLinks = {
    platform: [
      { label: 'Home', route: '/home' },
      { label: 'Explore', route: '/explore' },
      { label: 'About', route: '/about' },
      { label: 'Contact', route: '/contact' }
    ],
    campaigns: [
      { label: 'Create Campaign', route: '/create-campaign' },
      { label: 'Dashboard', route: '/dashboard' },
      { label: 'How It Works', route: '/how-it-works' }
    ],
    support: [
      { label: 'Help Center', route: '/help' },
      { label: 'Privacy Policy', route: '/privacy' },
      { label: 'Terms of Service', route: '/terms' }
    ]
  };

  readonly socialLinks = [
    { name: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
    { name: 'Discord', url: 'https://discord.com', icon: 'discord' },
    { name: 'GitHub', url: 'https://github.com', icon: 'github' },
    { name: 'Telegram', url: 'https://telegram.org', icon: 'telegram' }
  ];
}
