import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { LoadingComponent } from '@microshell/ui';
import { UtentiComponent } from './utenti.component';

const routes: Routes = [
  {
    path: '',
    component: UtentiComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    LoadingComponent,
    UtentiComponent
  ]
})
export class UtentiModule { } 