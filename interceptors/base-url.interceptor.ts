import { Inject, Injectable } from '@angular/core';
import { API_AUTH, API_MARVEL } from 'common/constants';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpParams,
  HttpParamsOptions,
  HttpErrorResponse
} from '@angular/common/http';
import { BehaviorSubject, catchError, filter, finalize, map, Observable, switchMap, take, throwError } from 'rxjs';
import { MarvelService } from 'src/app/marvel/marvel.service';
import { LoaderService } from 'src/app/loader/loader.service';
import { ToastService } from 'src/app/toast/toasts.service';

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {
  private refreshHashInProgress: boolean = false;
  private refreshHashSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    @Inject('BASE_AUTH_API_URL') private baseApiAuthUrl: string,
    @Inject('BASE_MARVEL_API') private baseApiMarvel: any,
    private loaderSrv: LoaderService,
    private marvelSrv: MarvelService,
    private toastSrv: ToastService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Requests para la API de autenticación
    if (request.url.indexOf(API_AUTH) !== -1) {
      request = request.clone({ url: request.url.replace(API_AUTH, this.baseApiAuthUrl) });
      return next.handle(request);
    }

    this.loaderSrv.show(true);

    // Requests para la API de Marvel
    if (request.url.indexOf(API_MARVEL) !== -1) {
      request = request.clone({
        url: request.url.replace(API_MARVEL, this.baseApiMarvel.apiUrl),
        headers: request.headers.delete('Authorization').delete('withCredentials')
      });
    }

    // Si no tenemos el hash o el ts en este punto
    if (!this.marvelSrv.hasMarvelHash || !this.marvelSrv.hasMarvelTs) {
      return this.refreshHash(next, request).pipe(
        catchError((err: HttpErrorResponse) => {
          // Error API Marvel
          if (err.status === 409) {
            if (this.refreshHashInProgress) {
              // Si refreshHashInProgress es true, esperaremos hasta que refreshHashSubject tenga un valor no nulo
              return this.refreshHashSubject.pipe(
                filter(result => result !== null),
                take(1),
                switchMap(() => next.handle(this.setHash(request)))
              );
            } else {
              this.refreshHashInProgress = true;
              this.refreshHashSubject.next(null);
              return this.refreshHash(next, request);
            }  
          }
          
          this.toastSrv.show(err.message, { classname: 'bg-danger text-light', delay: 5000 });
          return throwError(() => err.message);
        })
      );
    }

    return next.handle(this.setHash(request));
  }

  private getCalculatedHash(publickKey: string): Observable<any> {
    return this.marvelSrv.marvelHash(publickKey).pipe(
      map(res => this.marvelSrv.setMarvel(res))
    );
  }

  private setHash(request: HttpRequest<any>): HttpRequest<any> {
    const params: HttpParamsOptions = {
      fromObject: {
        ts: this.marvelSrv.getMarvelTs,
        apikey: this.baseApiMarvel.publicKey,
        hash: this.marvelSrv.getMarvelHash,
      }
    };

    return request.clone({
      params: new HttpParams(params)
    });
  }

  private refreshHash(next: HttpHandler, request: HttpRequest<any>) {
    return this.getCalculatedHash(this.baseApiMarvel.publicKey).pipe(
      switchMap((success: boolean) => {
        this.refreshHashSubject.next(success);
        return next.handle(this.setHash(request));
      }),
      // Cuando la llamada a getCalculatedHash se completa, reseteamos el refreshHashInProgress a false
      // para la próxima vez que sea necesario actualizar el hash aunque no sea necesario
      finalize(() => this.refreshHashInProgress = false)
    );
  }
}
