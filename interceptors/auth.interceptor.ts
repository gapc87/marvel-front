import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { BehaviorSubject, catchError, filter, finalize, map, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { ToastService } from 'src/app/toast/toasts.service';
import { LoaderService } from 'src/app/loader/loader.service';
import { MarvelService } from 'src/app/marvel/marvel.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private AUTH_HEADER = "Authorization";
  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authSrv: AuthenticationService,
    private marvelSrv: MarvelService,
    private toastSrv: ToastService,
    private loaderSrv: LoaderService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    this.loaderSrv.show(true);

    let token = this.authSrv.getToken;
    const hash = !!req.urlWithParams.match(this.marvelSrv.getMarvelHash)?.[0]

    if (token !== null && !hash) {
      return next.handle(this.addAuthenticationToken(req, token)).pipe(
        catchError((res: HttpErrorResponse) => {
          if (res && res.status === 401) {
            if (!!res.error.message.match('Bad Credentials')?.[0]) {
              this.toastSrv.show('Credenciales no válidas', { classname: 'bg-danger text-light', delay: 5000 });
              return throwError(() => new Error('Credenciales no válidas.'));
            }

            if (!!res.error.message.match('Unauthenticated.')?.[0]) {
              if (this.refreshTokenInProgress) {
                // Si refreshTokenInProgress es true, esperaremos hasta que refreshTokenSubject tenga un valor no nulo
                // lo que significa que el nuevo token está listo y podemos reintentar la petición de nuevo
                return this.refreshTokenSubject.pipe(
                  filter(result => result !== null),
                  take(1),
                  switchMap(() => {
                    if (token != null) return next.handle(this.addAuthenticationToken(req, token))
                    else return next.handle(req)
                  })
                );
              } else {
                this.refreshTokenInProgress = true;
    
                // Establezca refreshTokenSubject en null para que las siguientes llamadas a la API esperen hasta que se haya recuperado el nuevo token.
                this.refreshTokenSubject.next(null);
    
                return this.refreshAccessToken().pipe(
                  switchMap((success: boolean) => {
                    this.refreshTokenSubject.next(success);
                    if (this.authSrv.getToken != null) {
                      token = this.authSrv.getToken;
                      return next.handle(this.addAuthenticationToken(req, token))
                    } else {
                      return next.handle(req);
                    }
                  }),
                  // Cuando la llamada a refreshToken se completa, reseteamos el refreshTokenInProgress a false
                  // para la próxima vez que sea necesario actualizar el token
                  finalize(() => this.refreshTokenInProgress = false)
                );
              }
            }
          }

          // Si ocurrió un error no controlado, cerramos sesión
          this.authSrv.logout();
          this.toastSrv.show('Error no controlado', { classname: 'bg-danger text-light', delay: 5000 });
          return throwError(() => new Error('Error no controlado.'));
        }),
        finalize(() => this.loaderSrv.show(false))
      );
    } else {
      return next.handle(req).pipe(
        finalize(() => this.loaderSrv.show(false))
      );
    }
  }

  private refreshAccessToken(): Observable<any> {
    return this.authSrv.refreshToken().pipe(
      map(res => this.authSrv.storeTokenInStorage({ token: `${res.token_type} ${res.access_token}` }))
    );
  }

  private addAuthenticationToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    // Si aún no tenemos un token, entonces no debemos establecer el encabezado.
    // Aquí podríamos primero recuperar el token desde donde lo almacenamos.
    return request.clone({
      headers: request.headers
        .set('withCredentials', `true`)
        .set(this.AUTH_HEADER, token)
    });
  }
}
