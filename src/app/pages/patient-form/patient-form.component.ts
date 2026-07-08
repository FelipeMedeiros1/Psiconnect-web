import { Component, inject, OnInit } from '@angular/core';
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
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Patient } from 'src/app/model/patient';
import { PatientService } from 'src/app/services/patient.service';
import {
  LocationService,
  Municipality,
  ZipCodeAddress,
} from 'src/app/services/location.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss'],
})
export class PatientFormComponent implements OnInit {
  dataNascimento: number | null = null;
  idadePaciente: number | null = null;
  isEditing = false;
  patientId: number | null = null;
  municipalities: Municipality[] = [];
  loadingMunicipalities = false;
  municipalityLoadError = false;
  private lastZipCodeAddress?: ZipCodeAddress;
  private _snackBar = inject(MatSnackBar);

  constructor(
    public dialog: MatDialog,
    private formBuilder: NonNullableFormBuilder,
    private service: PatientService,
    private locationService: LocationService,
    private router: Router,
    private route: ActivatedRoute
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
  });

  transformData(formData: any): Patient | null {
    const dataNascimento = this.formatDate(formData.dataNascimento);
    const municipality = this.municipalities.find(
      (item) => item.id === Number(formData.cidade)
    );

    if (!dataNascimento) {
      console.error('Data inválida:', formData.dataNascimento);
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
        cep: String(formData.cep || '').replace(/\D/g, ''),
        numero: formData.numero,
        complemento: formData.complemento,
        cidade: municipality?.name || formData.cidade,
        uf: municipality?.state || formData.uf,
      },
    };
  }

  onSubmit() {
    const formData = this.form.value;

    if (this.isEditing && this.patientId !== null) {
      const updateData: Partial<Patient> = {
        nome: formData.nome,
        contato: {
          telefone: formData.telefone || undefined,
          email: formData.email || undefined,
        } as any,
      };

      this.submit(
        this.service.update(this.patientId, updateData),
        'Paciente atualizado com sucesso!'
      );
      return;
    }

    const transformedData = this.transformData(formData);

    if (transformedData) {
      console.log('Dados transformados:', transformedData);
      this.submit(
        this.service.save(transformedData),
        'Paciente salvo com sucesso!'
      );
    } else {
      this.onError('Erro: Data de nascimento inválida.');
    }
  }

  onCancel() {
    this.router.navigate(['/patient']);
  }

  private formatDate(value: string | Date | null): string | null {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    const dataNascimentoControl = this.form.get('dataNascimento');
    if (dataNascimentoControl) {
      dataNascimentoControl.valueChanges.subscribe((data) => {
        this.calcularIdade(data);
      });
    }

    this.setupZipCodeLookup();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isInteger(id) && id > 0) {
      this.isEditing = true;
      this.patientId = id;
      const patientFromList = history.state?.patient as Patient | undefined;
      if (patientFromList) {
        this.fillForm(patientFromList);
      }
      this.loadPatient(id, !!patientFromList);
    } else {
      this.loadMunicipalities();
    }
  }

  private loadMunicipalities() {
    this.loadingMunicipalities = true;
    this.locationService.getMunicipalities().subscribe({
      next: (municipalities) => {
        this.municipalities = municipalities;
        this.loadingMunicipalities = false;
      },
      error: (error) => {
        console.error('Não foi possível carregar os municípios.', error);
        this.loadingMunicipalities = false;
        this.municipalityLoadError = true;
        if (this.lastZipCodeAddress) {
          this.form.patchValue({ cidade: this.lastZipCodeAddress.localidade });
        }
      },
    });
  }

  onMunicipalitySelected(id: string) {
    const municipality = this.municipalities.find(
      (item) => item.id === Number(id)
    );
    if (municipality) {
      this.form.patchValue({ uf: municipality.state });
    }
  }

  private setupZipCodeLookup() {
    this.form.controls.cep.valueChanges
      .pipe(
        map((zipCode) => String(zipCode || '').replace(/\D/g, '')),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((zipCode) => {
          if (zipCode.length !== 8) {
            return of(null);
          }

          return this.locationService.getAddressByZipCode(zipCode).pipe(
            catchError((error) => {
              console.error('Não foi possível consultar o CEP.', error);
              this.onError('Não foi possível consultar o CEP.');
              return of(null);
            })
          );
        })
      )
      .subscribe((address) => {
        if (!address) {
          return;
        }

        if (address.erro) {
          this.onError('CEP não encontrado.');
          return;
        }

        this.lastZipCodeAddress = address;
        this.form.patchValue({
          logradouro: address.logradouro || '',
          bairro: address.bairro || '',
          complemento: address.complemento || '',
          cidade: this.municipalityLoadError
            ? address.localidade
            : address.ibge,
          uf: address.uf || '',
        });
      });
  }

  private submit(request: ReturnType<PatientService['save']>, message: string) {
    request.subscribe({
      next: (result) => {
        console.log('Sucesso:', result);
        this._snackBar.open(message, '', { duration: 3000 });
        this.router.navigate(['/patient']);
      },
      error: (error) => {
        const apiMessage = this.getApiErrorMessage(error);
        this.onError(
          apiMessage
            ? `Não foi possível salvar: ${apiMessage}`
            : 'Erro ao salvar o paciente. Por favor, tente novamente.',
          error
        );
      },
    });
  }

  private getApiErrorMessage(error: any): string {
    const response = error?.error;

    if (Array.isArray(response)) {
      return response
        .map((item) => `${item.campo || 'Campo'}: ${item.mensagem}`)
        .join('; ');
    }

    if (typeof response === 'string') {
      return response;
    }

    return response?.message || error?.message || '';
  }

  private loadPatient(id: number, hasFallbackData = false) {
    this.service.findById(id).subscribe({
      next: (patient) => this.fillForm(patient),
      error: (error) => {
        if (!hasFallbackData) {
          this.onError('Não foi possível carregar o paciente.', error);
        } else {
          console.error(
            'Não foi possível carregar os detalhes do paciente.',
            error
          );
        }
      },
    });
  }

  private fillForm(patient: Patient) {
    this.form.patchValue({
      dataNascimento: patient.dataNascimento
        ? new Date(patient.dataNascimento)
        : ('' as any),
      nomeResponsavel: patient.responsavel?.nomeResponsavel || '',
      cpfResponsavel: patient.responsavel?.cpfResponsavel || '',
      nome: patient.nome || '',
      cpf: patient.cpf || '',
      profissao: patient.profissao || '',
      telefone: patient.telefone || patient.contato?.telefone || '',
      email: patient.email || patient.contato?.email || '',
      logradouro: patient.endereco?.logradouro || '',
      bairro: patient.endereco?.bairro || '',
      cep: patient.endereco?.cep || '',
      numero: patient.endereco?.numero || '',
      complemento: patient.endereco?.complemento || '',
      cidade: patient.endereco?.cidade || '',
      uf: patient.endereco?.uf || '',
    });
  }
}
