import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { combineLatest, map, switchMap } from 'rxjs';
import { MarvelService } from 'src/app/marvel/marvel.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {

  @Output()
  toggleComponent = new EventEmitter<boolean>();

  loginForm = new FormGroup({
    email: new FormControl({
      value: '', disabled: false
    }, [Validators.required, Validators.email]),
    password: new FormControl({
      value: '', disabled: false
    }, [Validators.required, Validators.minLength(6)]),
  });

  constructor(
    private _authSrv: AuthenticationService,
    private marvelSrv: MarvelService,
  ) { }

  login() {
    const credentials: any = { ...this.loginForm.value };

    this._authSrv.login(credentials).pipe(
      map((res: any) => {
        if (res) {
          this._authSrv.storeTokenInStorage({token: `${res.token_type} ${res.access_token}`});
          this.getTeam();
        }
      })
    ).subscribe();
  }

  getTeam() {
    this._authSrv.getTeam().pipe(
      switchMap((res: any) => {
        const heroes = Object.keys(res.team).filter((h: string) => h.startsWith('hero') && res.team[h] != null);
        const heroesObs: any[] = [];
        Object.values(heroes)
          .forEach((value: string) => {
            heroesObs.push({ [value]: this.marvelSrv.getHeroe(res.team[value]) })
          });

        return heroesObs;
      }),
      map((heroes) => {
        combineLatest({ ...heroes }).pipe(
          map((res: any) => {
            Object.keys(res).forEach((key: string) => {
              this.marvelSrv.setHeroes(key, res[key].data.results[0]);
              this.marvelSrv.setHeroInStorage(key, res[key].data.results[0]);
            });
          })
        ).subscribe();
      })
    ).subscribe();
  }

  toggle() {
    this.toggleComponent.emit(true);
  }
}
