import { Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent {
  isLoading = false;
  error = false;

  validateForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {}

  submitForm(): void {
    if (this.validateForm.valid) {
      console.log('submit', this.validateForm.value);
      this.router.navigate(['/dashboard']).then(() => {
        window.location.reload();
      });
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  passwordVisible = false;
  password?: string;

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      userName: ['admin', [Validators.required]],
      password: ['a', [Validators.required]],
      remember: [true],
    });
  }
}