import { ProductService } from 'src/app/core/services/product.service';
import { SortPipe } from './sort.pipe';

describe('SortPipe', () => {
  let productService: ProductService;
  it('create an instance', () => {
    const pipe = new SortPipe(productService);
    expect(pipe).toBeTruthy();
  });
});
