import { Component, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  Observable,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { CepService } from 'src/app/services/cep.service';
import {
  PsychologistRegistration,
  PsychologistService,
} from 'src/app/services/psychologist.service';

@Component({
  selector: 'app-psychologist-form',
  templateUrl: './psychologist-form.component.html',
  styleUrls: ['./psychologist-form.component.scss'],
})
export class PsychologistFormComponent implements OnInit, OnDestroy {
  readonly specialties = ['INFANTIL', 'ADOLECENTE', 'ADULTO', 'CASAL', 'FAMILIAR'];
  private readonly subscriptions = new Subscription();
  buscandoCep = false;
  salvando = false;
  editId: number | null = null;

  readonly form = this.formBuilder.group({
    nome: ['', Validators.required],
    crp: ['', [Validators.required, Validators.pattern(/^\d{4,7}$/)]],
    especialidade: ['', Validators.required],
    telefone: ['', [Validators.required, Validators.pattern(/^(\(\d{2}\)|\d{2})\s?\d{4,5}-?\d{4}$/)]],
    email: ['', [Validators.required, Validators.email]],
    logradouro: ['', Validators.required],
    numero: [''],
    complemento: [''],
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    bairro: ['', Validators.required],
    cidade: ['', Validators.required],
    uf: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)]],
  });

  constructor(
    private formBuilder: NonNullableFormBuilder,
    private psychologistService: PsychologistService,
    private cepService: CepService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.editId = id;
      this.psychologistService.findById(id).subscribe((psychologist) => {
        this.form.patchValue({
          nome: psychologist.nome,
          crp: psychologist.crp,
          especialidade: psychologist.especialidade,
          telefone: psychologist.contato?.telefone ?? '',
          email: psychologist.contato?.email ?? '',
          logradouro: psychologist.endereco?.logradouro ?? '',
          numero: psychologist.endereco?.numero ?? '',
          complemento: psychologist.endereco?.complemento ?? '',
          cep: psychologist.endereco?.cep ?? '',
          bairro: psychologist.endereco?.bairro ?? '',
          cidade: psychologist.endereco?.cidade ?? '',
          uf: psychologist.endereco?.uf ?? '',
        });
        this.form.controls.crp.disable();
        this.form.controls.especialidade.disable();
      });
    }

    const cepControl = this.form.controls.cep;
    this.subscriptions.add(
      cepControl.valueChanges
        .pipe(
          map((cep) => cep.replace(/\D/g, '')),
          distinctUntilChanged(),
          debounceTime(300),
          filter((cep) => cep.length === 8),
          tap(() => (this.buscandoCep = true)),
          switchMap((cep) =>
            this.cepService.buscar(cep).pipe(
              catchError(() => {
                this.buscandoCep = false;
                this.snackBar.open('Não foi possível consultar o CEP.', '', { duration: 5000 });
                return EMPTY;
              })
            )
          )
        )
        .subscribe((endereco) => {
          this.buscandoCep = false;
          if (endereco.erro) {
            cepControl.setErrors({ cepNaoEncontrado: true });
            this.snackBar.open('CEP não encontrado.', '', { duration: 5000 });
            return;
          }

          this.form.patchValue(
            {
              cep: endereco.cep.replace(/\D/g, ''),
              logradouro: endereco.logradouro,
              complemento: endereco.complemento,
              bairro: endereco.bairro,
              cidade: endereco.localidade,
              uf: endereco.uf,
            },
            { emitEvent: false }
          );
        })
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Preencha os campos obrigatórios corretamente.', '', { duration: 5000 });
      return;
    }

    const data = this.form.getRawValue();
    const psychologist: PsychologistRegistration = {
      nome: data.nome,
      crp: data.crp,
      especialidade: data.especialidade,
      contato: { telefone: data.telefone, email: data.email },
      endereco: {
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        cep: data.cep.replace(/\D/g, ''),
        bairro: data.bairro,
        cidade: data.cidade,
        uf: data.uf.toUpperCase(),
      },
    };

    this.salvando = true;
    const request: Observable<unknown> = this.editId
      ? this.psychologistService.update(this.editId, {
          nome: psychologist.nome,
          contato: psychologist.contato,
          endereco: psychologist.endereco,
        })
      : this.psychologistService.save(psychologist);
    request.subscribe({
      next: () => {
        this.snackBar.open('Psicólogo salvo com sucesso!', '', { duration: 3000 });
        this.router.navigate(['/psychologist']);
      },
      error: () => {
        this.salvando = false;
        this.snackBar.open('Erro ao salvar o psicólogo.', '', { duration: 5000 });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/psychologist']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
