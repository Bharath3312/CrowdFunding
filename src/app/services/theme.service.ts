import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal to store the current theme
  private currentTheme = signal<Theme>('light');

  // Computed signal to get the current theme
  readonly theme = this.currentTheme.asReadonly();

  // Computed signal to check if dark mode is active
  readonly isDarkMode = computed(() => this.currentTheme() === 'dark');

  constructor() {
    // Load theme from localStorage on initialization
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.currentTheme.set(savedTheme);
    }

    // Apply the theme to the document
    this.applyTheme(this.currentTheme());
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    localStorage.setItem('theme', theme);
  }

  /**
   * Apply the theme to the document root
   */
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Add the new theme class for Tailwind dark mode
    root.classList.add(theme);

    // Keep data-theme attribute for any remaining custom CSS
    root.setAttribute('data-theme', theme);
  }
}