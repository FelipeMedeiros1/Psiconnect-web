import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  switchMap,
} from 'rxjs';
import {
  Psychologist,
  PsychologistSpecialty,
} from 'src/app/model/psychologist';
import {
  LocationService,
  Municipality,
  ZipCodeAddress,
} from 'src/app/services/location.service';
import { PsychologistService } from 'src/app/services/psychologist.service';

@Component({
  selector: 'app-psychologist-form',
  templateUrl: './psychologist-form.component.html',
  styleUrls: ['./psychologist-form.component.scss'],
})
export class PsychologistFormComponent implements OnInit {
  private snackBar = inject(MatSnackBar);

  specialties: Array<{ value: PsychologistSpecialty; label: string }> = [
    { value: 'INFANTIL', label: 'Infantil' },
    { value: 'ADOLECENTE', label: 'Adolescente' },
    { value: 'ADULTO', label: 'Adulto' },
    { value: 'CASAL', label: 'Casal' },
    { value: 'FAMILIAR', label: 'Familiar' },
  ];
  municipalities: Municipality[] = [];
  loadingMunicipalities = false;
  municipalityLoadError = false;
  saving = false;
  searchingZipCode = false;
  private lastZipCodeAddress?: ZipCodeAddress;

  form = this.formBuilder.group({
    nome: ['', Validators.required],
    crp: ['', [Validators.required, Validators.pattern(/^\d{4,7}$/)]],
    especialidade: ['' as PsychologistSpecialty, Validators.required],
    telefone: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(\(\d{2}\)|\d{2})\s?\d{4,5}-?\d{4}$/),
      ],
    ],
    email: ['', [Validators.required, Validators.email]],
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    logradouro: ['', Validators.required],
    numero: [''],
    complemento: [''],
    bairro: ['', Validators.required],
    cidade: ['', Validators.required],
    uf: ['', Validators.required],
  });

  constructor(
    private formBuilder: NonNullableFormBuilder,
    private psychologistService: PsychologistService,
    private locationService: LocationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMunicipalities();
    this.setupZipCodeLookup();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showMessage('Preencha corretamente os campos obrigatórios.');
      return;
    }

    const value = this.form.getRawValue();
    const municipality = this.municipalities.find(
      (item) => item.id === Number(value.cidade)
    );
    const psychologist: Psychologist = {
      nome: value.nome,
      crp: value.crp,
      especialidade: value.especialidade,
      contato: {
        telefone: value.telefone,
        email: value.email,
      },
      endereco: {
        logradouro: value.logradouro,
        bairro: value.bairro,
        cep: value.cep.replace(/\D/g, ''),
        cidade: municipality?.name || value.cidade,
        uf: municipality?.state || value.uf,
        complemento: value.complemento,
        numero: value.numero,
      },
    };

    this.saving = true;
    this.psychologistService.save(psychologist).subscribe({
      next: () => {
        this.showMessage('Psicólogo cadastrado com sucesso!');
        this.router.navigate(['/psychologist']);
      },
      error: (error) => {
        this.saving = false;
        this.showMessage(this.getApiError(error));
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/psychologist']);
  }

  onMunicipalitySelected(id: string): void {
    const municipality = this.municipalities.find(
      (item) => item.id === Number(id)
    );
    if (municipality) {
      this.form.patchValue({ uf: municipality.state });
    }
  }

  private loadMunicipalities(): void {
    this.loadingMunicipalities = true;
    this.locationService.getMunicipalities().subscribe({
      next: (municipalities) => {
        this.municipalities = municipalities;
        this.loadingMunicipalities = false;
      },
      error: () => {
        this.loadingMunicipalities = false;
        this.municipalityLoadError = true;
        if (this.lastZipCodeAddress) {
          this.form.patchValue({ cidade: this.lastZipCodeAddress.localidade });
        }
      },
    });
  }

  private setupZipCodeLookup(): void {
    this.form.controls.cep.valueChanges
      .pipe(
        map((zipCode) => zipCode.replace(/\D/g, '')),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((zipCode) => {
          if (zipCode.length !== 8) {
            this.searchingZipCode = false;
            return of(null);
          }

          this.searchingZipCode = true;
          return this.locationService.getAddressByZipCode(zipCode).pipe(
            catchError((error) => {
              console.error('Não foi possível consultar o CEP.', error);
              this.showMessage('Não foi possível consultar o CEP.');
              return of(null);
            }),
            finalize(() => (this.searchingZipCode = false))
          );
        })
      )
      .subscribe((address) => {
        if (!address) return;
        if (address.erro) {
          this.showMessage('CEP não encontrado.');
          return;
        }

        this.lastZipCodeAddress = address;
        this.form.patchValue({
          logradouro: address.logradouro || '',
          complemento: address.complemento || '',
          bairro: address.bairro || '',
          cidade: this.municipalityLoadError
            ? address.localidade
            : address.ibge,
          uf: address.uf || '',
        });
      });
  }

  private getApiError(error: any): string {
    const response = error?.error;
    if (Array.isArray(response)) {
      return response
        .map((item) => `${item.campo || 'Campo'}: ${item.mensagem}`)
        .join('; ');
    }
    if (typeof response === 'string') {
      return response.trim().startsWith('<!DOCTYPE')
        ? 'A API não foi encontrada. Reinicie o servidor do front-end.'
        : response;
    }

    return response?.message || 'Não foi possível cadastrar o psicólogo.';
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, '', { duration: 5000 });
  }
}
