import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ILogin } from 'interfaces/auth';
import { map, Observable, of } from 'rxjs';
import { ToastService } from '../toast/toasts.service';

import { API_AUTH } from 'common/constants';
import { Router } from '@angular/router';
import { MarvelService } from '../marvel/marvel.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private _http: HttpClient,
    private _toastSrv: ToastService,
    private _marvelSrv: MarvelService,
    private _router: Router,
    ) { }

  login(body: ILogin): Observable<any> {
    return this._http.post<ILogin>(`${API_AUTH}/auth/login`, body, { observe: 'response' }).pipe(
      map((response: any) => {
        if (response.status === 200)
          this._toastSrv.show(`Bienvenido/a ${response.body.user.name}!`, { classname: 'bg-success text-light', delay: 5000 });
        
        return response.body;
      })
    );
  }

  register(body: any): Observable<any> {
    return this._http.post<any>(`${API_AUTH}/auth/register`, body, { observe: 'response' }).pipe(
      map((response: any) => {
        if (response.status === 200)
          this._toastSrv.show(`Bienvenido/a ${response.body.user.name}!`, { classname: 'bg-success text-light', delay: 5000 });
        else if (response.status === 400)
          this._toastSrv.show(response.message, { classname: 'bg-danger text-light', delay: 5000 });

        return response.body;
      })
    );
  }

  refreshToken(): Observable<any> {
    const auth = this.isLoggedIn ? this.getToken : false;
    
    if (!!auth) {
      const headers = new HttpHeaders().set('Authorization', auth);
      return this._http.get(`${API_AUTH}/auth/refresh`, { headers });
    }

    return of(null);
  }

  storeTokenInStorage(obj: any): boolean {
    localStorage.setItem('token', obj.token);
    return true;
  }

  getTeam(): Observable<any> {
    return this._http.get(`${API_AUTH}/team`);
  }

  getTeamHero(hero_key: string): Observable<any> {
    return this._http.get(`${API_AUTH}/team/${hero_key}`);
  }

  saveTeam(field: string, team: any): Observable<any> {
    return this._http.put(`${API_AUTH}/team/${field}`, { team });
  }

  deleteHero(hero: string): Observable<any> {
    return this._http.delete(`${API_AUTH}/team/${hero}`);
  }

  logout(): void {
    localStorage.removeItem('token');
    this._marvelSrv.deleteAllHeroesFromStorage();
    this._router.navigate(['/']);
  }

  get getToken(): string|null {
    return localStorage.getItem('token');
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
