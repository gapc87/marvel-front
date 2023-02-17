import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, map } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/authentication.service';
import { MarvelService } from '../../marvel.service';

@Component({
    selector: 'app-team',
    templateUrl: './team.component.html',
})
export class TeamComponet implements OnInit {

    teamForm: FormGroup = new FormGroup({
        name: new FormControl({
            value: '', disabled: false
        }, [Validators.required]),
        description: new FormControl({
            value: '', disabled: false
        }, [Validators.required]),
    });

    constructor(
        private _authSrv: AuthenticationService,
        public _marvelSrv: MarvelService,
    ) { }

    ngOnInit(): void {
        this.getTeam();

        this.teamForm.controls['name'].valueChanges.pipe(
            debounceTime(1000),
            map(name => this._authSrv.saveTeam('name', { name }).subscribe())
        ).subscribe();

        this.teamForm.controls['description'].valueChanges.pipe(
            debounceTime(1000),
            map(description => this._authSrv.saveTeam('description', { description }).subscribe())
        ).subscribe();
    }

    getTeam() {
        this._authSrv.getTeam().pipe(
            map((res: any) => {
                this.teamForm.patchValue(res.team, { emitEvent: false })
            })
        ).subscribe();
    }
}
