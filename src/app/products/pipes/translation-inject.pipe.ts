import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translationInject',
})
export class TranslationInjectPipe implements PipeTransform {
  transform(translatedText: string, value1: any, value2?: any): string {
    let finalTranslation = '';

    if (typeof value1 !== 'undefined') {
      finalTranslation = translatedText.replace('[X]', value1.toString());
    }

    if (typeof value2 !== 'undefined') {
      finalTranslation = finalTranslation.replace(
        '[Y]',
        "<span class='font-bold'>" + value2.toString() + '</span>'
      );
    }

    return finalTranslation;
  }
}
