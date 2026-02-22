import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private message: MessageService) {}
   success(summary: string, detail?: string) {
    this.message.add({
      severity: 'success',
      summary,
      detail,
      life: 3000
    });
  }

  error(summary: string, detail?: string) {
    this.message.add({
      severity: 'error',
      summary,
      detail,
      life: 4000
    });
  }

  info(summary: string, detail?: string) {
    this.message.add({
      severity: 'info',
      summary,
      detail,
      life: 3000
    });
  }

  warn(summary: string, detail?: string) {
    this.message.add({
      severity: 'warn',
      summary,
      detail,
      life: 3500
    });
  }

  clear() {
    this.message.clear();
  }
}
