import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categorySearch',
})
export class CategorySearchPipe implements PipeTransform {
  transform(categories: any[], products: any[]): any[] {
    if (products.length === 0) {
      return [];
    }
    if (categories.length !== 0) {
      categories.forEach((category: any) => {
        if (products.length !== 0) {
          const tempProducts: any[] = [];
          products.forEach((product: any) => {
            const result = product.categories.some(
              (x: any) =>
                x.term_id === category.term_id || x.parent === category.term_id
            );
            if (result) {
              tempProducts.push(product);
            }
          });
          category.products = tempProducts;
        }
      });
    }
    const filteredCategory = categories.filter(
      (x: any) => x.products.length !== 0
    );
    return filteredCategory;
  }
}
