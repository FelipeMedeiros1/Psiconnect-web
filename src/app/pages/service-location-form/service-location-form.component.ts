import { Component, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, filter, map, Subscription, switchMap, tap } from 'rxjs';
import { CepService } from 'src/app/services/cep.service';
import { ServiceLocationService } from 'src/app/services/service-location.service';

@Component({ selector: 'app-service-location-form', templateUrl: './service-location-form.component.html', styleUrls: ['./service-location-form.component.scss'] })
export class ServiceLocationFormComponent implements OnInit, OnDestroy {
  id = 0;
  buscandoCep = false;
  private readonly subscriptions = new Subscription();
  form = this.fb.group({ nomeLugar:['',Validators.required], logradouro:[''], numero:[''], complemento:[''], bairro:[''], cep:['', Validators.pattern(/^$|^\d{5}-?\d{3}$/)], cidade:[''], uf:[''] });
  constructor(private fb:NonNullableFormBuilder, private service:ServiceLocationService, private cepService:CepService, private snackBar:MatSnackBar, private route:ActivatedRoute, private router:Router) {}
  ngOnInit():void {
    this.id=Number(this.route.snapshot.paramMap.get('id'));
    if(this.id) this.service.find(this.id).subscribe(i=>this.form.patchValue({nomeLugar:i.nomeLugar,...(i.endereco??{})}));
    const cepControl = this.form.controls.cep;
    this.subscriptions.add(cepControl.valueChanges.pipe(
      map(cep => cep.replace(/\D/g, '')), distinctUntilChanged(), debounceTime(300),
      filter(cep => cep.length === 8), tap(() => this.buscandoCep = true),
      switchMap(cep => this.cepService.buscar(cep).pipe(catchError(() => {
        this.buscandoCep = false; this.snackBar.open('Não foi possível consultar o CEP.', '', {duration:5000}); return EMPTY;
      })))
    ).subscribe(endereco => {
      this.buscandoCep = false;
      if(endereco.erro){ cepControl.setErrors({cepNaoEncontrado:true}); this.snackBar.open('CEP não encontrado.', '', {duration:5000}); return; }
      this.form.patchValue({cep:endereco.cep.replace(/\D/g,''),logradouro:endereco.logradouro,complemento:endereco.complemento,bairro:endereco.bairro,cidade:endereco.localidade,uf:endereco.uf},{emitEvent:false});
    }));
  }
  save():void { if(this.form.invalid){this.form.markAllAsTouched();this.snackBar.open('Preencha os campos corretamente.','',{duration:4000});return;} const v=this.form.getRawValue(); const hasAddress=!!(v.cep||v.logradouro||v.cidade); const data={nomeLugar:v.nomeLugar,endereco:hasAddress?{logradouro:v.logradouro,numero:v.numero,complemento:v.complemento,bairro:v.bairro,cep:v.cep.replace(/\D/g,''),cidade:v.cidade,uf:v.uf.toUpperCase()}:null}; const req=this.id?this.service.update(this.id,data):this.service.save(data); req.subscribe({next:()=>this.cancel(),error:()=>this.snackBar.open('Erro ao salvar o local.','',{duration:5000})}); }
  cancel():void { this.router.navigate(['/service-location']); }
  ngOnDestroy():void { this.subscriptions.unsubscribe(); }
}
