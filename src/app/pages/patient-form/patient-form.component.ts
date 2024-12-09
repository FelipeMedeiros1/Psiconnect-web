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
import { Patient } from 'src/app/model/patient';
import { PatientService } from 'src/app/services/patient.service';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss'],
})
export class PatientFormComponent implements OnInit {
  dataNascimento: number | null = null;
  idadePaciente: number | null = null;
  private _snackBar = inject(MatSnackBar);

  constructor(
    public dialog: MatDialog,
    private formBuilder: NonNullableFormBuilder,
    private service: PatientService
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
    const formData = this.form.value;
    const transformedData = this.transformData(formData);

    if (transformedData) {
      console.log('Dados transformados:', transformedData);
      this.service.save(transformedData).subscribe({
        next: (result) => {
          console.log('Sucesso:', result);
          this._snackBar.open('Paciente salvo com sucesso!', '', {
            duration: 3000,
          });
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
    this.form.reset();
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
  }
}
