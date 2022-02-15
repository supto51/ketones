import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImplicitComponent } from './implicit/implicit.component';
import { ImplicitRoutingModule } from './implicit-routing.module';

@NgModule({
  declarations: [ImplicitComponent],
  imports: [CommonModule, ImplicitRoutingModule]
})
export class ImplicitModule {}
