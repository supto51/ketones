import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
})
export class SearchPipe implements PipeTransform {
  transform(products: any[], term: string, pageType: string): any[] {
    if (pageType === 'search-modal') {
      if (term === '') {
        return [];
      }
    }
    if (pageType === 'search-page') {
      if (term === '') {
        return products;
      }
    }
    return products.filter((x: any) =>
      x.post_title.toLowerCase().includes(term.toLowerCase())
    );
  }
}
