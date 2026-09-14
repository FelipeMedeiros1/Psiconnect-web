import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  NonNullableFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from 'src/app/model/patient';
import { PatientService } from 'src/app/services/patient.service';
import { CepService } from 'src/app/services/cep.service';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, filter, map, Subscription, switchMap, tap } from 'rxjs';
import { ServiceLocation } from 'src/app/model/service-location';
import { ServiceLocationService } from 'src/app/services/service-location.service';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss'],
})
export class PatientFormComponent implements OnInit, OnDestroy {
  dataNascimento: number | null = null;
  idadePaciente: number | null = null;
  private _snackBar = inject(MatSnackBar);
  private readonly subscriptions = new Subscription();
  buscandoCep = false;
  editId: number | null = null;
  locations: ServiceLocation[] = [];

  constructor(
    public dialog: MatDialog,
    private formBuilder: NonNullableFormBuilder,
    private service: PatientService,
    private cepService: CepService,
    private locationService: ServiceLocationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  form = this.formBuilder.group({
    dataNascimento: ['', Validators.required],
    nomeResponsavel: [''],
    cpfResponsavel: [''],
    nome: [''],
    cpf: [''],
    profissao: [''],
    telefone: [''],
    email: [''],
    logradouro: [''],
    bairro: [''],
    cep: [''],
    numero: [''],
    complemento: [''],
    cidade: [''],
    uf: [''],
    localAtendimentoId: [0],
  });

  transformData(formData: any): Patient | null {
    const dataNascimentoStr = formData.dataNascimento;
    const dataNascimento = new Date(dataNascimentoStr);

    if (isNaN(dataNascimento.getTime())) {
      console.error('Data inválida:', dataNascimentoStr);
      return null;
    }

    return {
      responsavel: {
        nomeResponsavel: formData.nomeResponsavel,
        cpfResponsavel: formData.cpfResponsavel,
      },
      dataNascimento: dataNascimento,
      nome: formData.nome,
      cpf: formData.cpf,
      profissao: formData.profissao,
      contato: {
        telefone: formData.telefone,
        email: formData.email,
      },
      endereco: {
        logradouro: formData.logradouro,
        bairro: formData.bairro,
        cep: formData.cep,
        numero: formData.numero,
        complemento: formData.complemento,
        cidade: formData.cidade,
        uf: formData.uf,
      },
    };
  }

  onSubmit() {
    const formData = this.form.getRawValue();
    const transformedData = this.transformData(formData);

    if (transformedData) {
      console.log('Dados transformados:', transformedData);
      const request = this.editId
        ? this.service.update(this.editId, {
            nome: transformedData.nome,
            contato: transformedData.contato,
            endereco: transformedData.endereco,
          })
        : this.service.save(transformedData);
      request.pipe(switchMap((result) =>
        this.service.associateLocation(result.id!, formData.localAtendimentoId || null)
      )).subscribe({
        next: (result) => {
          console.log('Sucesso:', result);
          this._snackBar.open('Paciente salvo com sucesso!', '', {
            duration: 3000,
          });
          this.router.navigate(['/patient']);
        },
        error: (error) =>
          this.onError(
            'Erro ao salvar o paciente. Por favor, tente novamente.',
            error
          ),
      });
    } else {
      this.onError('Erro: Data de nascimento inválida.');
    }
  }

  onCancel() {
    this.router.navigate(['/patient']);
  }

  onError(message: string, error?: any): void {
    console.error(message, error);
    try {
      this._snackBar.open(message, '', { duration: 5000 });
    } catch (snackbarError) {
      console.error('Erro ao exibir o SnackBar:', snackbarError);
      alert(`Erro: ${message} e ao exibir a mensagem de erro.`);
    }
  }

  calcularIdade(dataNascimento: string | null) {
    if (dataNascimento) {
      const hoje = new Date();
      const nascimento = new Date(dataNascimento);
      this.idadePaciente = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        this.idadePaciente--;
      }
    } else {
      this.idadePaciente = null;
    }
  }

  ngOnInit() {
    this.locationService.list().subscribe((locations) => {
      this.locations = locations.filter((location) => location.ativo);
    });
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.editId = id;
      this.service.findById(id).subscribe((patient) => {
        this.form.patchValue({
          dataNascimento: patient.dataNascimento as unknown as string,
          nomeResponsavel: patient.responsavel?.nomeResponsavel ?? '',
          cpfResponsavel: patient.responsavel?.cpfResponsavel ?? '',
          nome: patient.nome,
          cpf: patient.cpf,
          profissao: patient.profissao,
          telefone: patient.contato?.telefone ?? patient.telefone ?? '',
          email: patient.contato?.email ?? patient.email ?? '',
          logradouro: patient.endereco?.logradouro ?? '',
          bairro: patient.endereco?.bairro ?? '',
          cep: patient.endereco?.cep ?? '',
          numero: patient.endereco?.numero ?? '',
          complemento: patient.endereco?.complemento ?? '',
          cidade: patient.endereco?.cidade ?? '',
          uf: patient.endereco?.uf ?? '',
          localAtendimentoId: patient.localAtendimento?.id ?? 0,
        });
        this.form.controls.dataNascimento.disable();
        this.form.controls.cpf.disable();
        this.form.controls.profissao.disable();
      });
    }
    const dataNascimentoControl = this.form.get('dataNascimento');
    if (dataNascimentoControl) {
      dataNascimentoControl.valueChanges.subscribe((data) => {
        this.calcularIdade(data);
      });
    }

    const cepControl = this.form.get('cep');
    if (cepControl) {
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
                  this._snackBar.open('Não foi possível consultar o CEP.', '', {
                    duration: 5000,
                  });
                  return EMPTY;
                })
              )
            )
          )
          .subscribe((endereco) => {
            this.buscandoCep = false;

            if (endereco.erro) {
              cepControl.setErrors({ cepNaoEncontrado: true });
              this._snackBar.open('CEP não encontrado.', '', { duration: 5000 });
              return;
            }

            this.form.patchValue(
              {
                cep: endereco.cep.replace(/\D/g, ''),
                logradouro: endereco.logradouro,
                bairro: endereco.bairro,
                cidade: endereco.localidade,
                uf: endereco.uf,
                complemento: endereco.complemento,
              },
              { emitEvent: false }
            );
          })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
