import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Error404Component } from './components/error404/error404.component';
import { TranslateModule } from '@ngx-translate/core';
import { TextSanitizerPipe } from './pipes/text-sanitizer.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';
import { LoaderComponent } from './components/loader/loader.component';
import { SearchBlogPipe } from './pipes/search-blog.pipe';
import { LottiePlayerDirective } from './directives/lottie-player.directive';
import { ModalPurchaseWarningComponent } from './components/modal-purchase-warning/modal-purchase-warning.component';
import { FormatPipe } from './pipes/format-string.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    Error404Component,
    TextSanitizerPipe,
    SearchPipe,
    HighlightPipe,
    LoaderComponent,
    SearchBlogPipe,
    LottiePlayerDirective,
    ModalPurchaseWarningComponent,
    FormatPipe
  ],
  imports: [CommonModule, TranslateModule, MatMenuModule],
  exports: [
    Error404Component,
    TextSanitizerPipe,
    SearchPipe,
    HighlightPipe,
    LoaderComponent,
    SearchBlogPipe,
    LottiePlayerDirective,
    ModalPurchaseWarningComponent,
    FormatPipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatMenuModule
  ]
})
export class SharedModule {}
