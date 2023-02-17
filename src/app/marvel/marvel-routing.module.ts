import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailComponent } from './heroes/detail/detail.component';
import { ListHeroesComponent } from './heroes/list-heroes/list-heroes.component';
import { TeamComponet } from './heroes/team/team.component';

import { 
    AuthGuardService as AuthGuard 
  } from '../auth/auth-guard.service';

const routes: Routes = [{
        path: '',
        component: ListHeroesComponent
    }, {
        path: 'heroe/:id',
        component: DetailComponent
    }, {
        path: 'mi-equipo',
        component: TeamComponet,
        canActivate: [AuthGuard]
    }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MarvelRoutingModule { }
