import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly querySubject = new BehaviorSubject('');
  readonly query$ = this.querySubject.asObservable();

  setQuery(query: string): void {
    this.querySubject.next(this.normalize(query));
  }

  matches(query: string, ...values: unknown[]): boolean {
    if (!query) return true;
    return this.normalize(values.filter((value) => value != null).join(' ')).includes(query);
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
