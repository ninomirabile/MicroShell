import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UtentiComponent } from './entry.component';

const routes: Routes = [
  {
    path: '',
    component: UtentiComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('../app.module').then(m => m.AppModule)
      }
    ]
  }
];

@NgModule({
  declarations: [
    UtentiComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  providers: []
})
export class RemoteEntryModule { } 