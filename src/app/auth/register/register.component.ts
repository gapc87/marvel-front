import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { map, of, switchMap, throwError } from 'rxjs';
import { ToastService } from 'src/app/toast/toasts.service';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {

  @Output()
  toggleComponent = new EventEmitter<boolean>();

  registerForm = new FormGroup({
    name: new FormControl({
      value: '', disabled: false
    }, [Validators.required]),
    email: new FormControl({
      value: '', disabled: false
    }, [Validators.required, Validators.email]),
    password: new FormControl({
      value: '', disabled: false
    }, [Validators.required, Validators.minLength(8)]),
  });

  constructor(private _authSrv: AuthenticationService, private toastSrv: ToastService) { }

  register() {
    if (this.registerForm.invalid) {
      return;
    }

    const data: any = { ...this.registerForm.value };

    this._authSrv.register(data).pipe(
      switchMap(res => {
        if (res.status == 400) {
          
          this.registerForm.reset();
          return throwError(null);
        }

        return of(res);
      }),
      map(res => {
        this._authSrv.storeTokenInStorage({token: `${res.token_type} ${res.access_token}`});
      })
    ).subscribe();
  }

  toggle() {
    this.toggleComponent.emit(false);
  }
}

