import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, combineLatest, map, Observable, of } from 'rxjs';
import { ServiceLocation } from 'src/app/model/service-location';
import { SearchService } from 'src/app/services/search.service';
import { ServiceLocationService } from 'src/app/services/service-location.service';

@Component({ selector: 'app-service-location', templateUrl: './service-location.component.html' })
export class ServiceLocationComponent {
  readonly columns = ['nome', 'endereco', 'status', 'acoes'];
  locations$: Observable<ServiceLocation[]>;
  constructor(private service: ServiceLocationService, private router: Router, private search: SearchService) { this.locations$ = this.load(); }
  load(): Observable<ServiceLocation[]> { return combineLatest([this.service.list().pipe(catchError(() => of([]))), this.search.query$]).pipe(map(([items,q]) => items.filter(i => this.search.matches(q, i.nomeLugar, i.ativo?'ativo':'inativo', JSON.stringify(i.endereco))))); }
  add(): void { this.router.navigate(['/service-location/include']); }
  edit(item: ServiceLocation): void { this.router.navigate(['/service-location/edit', item.id]); }
  deactivate(item: ServiceLocation): void { if (!confirm(`Inativar ${item.nomeLugar}?`)) return; this.service.deactivate(item.id).subscribe(() => this.locations$ = this.load()); }
  address(item: ServiceLocation): string { const e=item.endereco; return e ? `${e.logradouro}, ${e.numero} - ${e.bairro}, ${e.cidade}/${e.uf}` : 'Online / sem endereço físico'; }
}
