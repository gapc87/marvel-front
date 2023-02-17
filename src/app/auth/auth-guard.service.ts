import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthGuardService implements CanActivate {

    constructor(public _authSrv: AuthenticationService, public _router: Router) { }

    canActivate(): boolean {
        if (!this._authSrv.isLoggedIn) {
            this._router.navigate(['/']);
            return false;
        }

        return true;
    }
}