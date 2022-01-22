import { Injectable } from '@angular/core';

@Injectable()
export class ProductsUtilityService {
  constructor() {}

  getProductPrice(variations: any) {
    let minPrice = Number.MAX_SAFE_INTEGER;
    let discountPrice = 0;
    if (variations) {
      Object.values(variations).forEach((element: any) => {
        if (element.mvproduct_ordertype === 'ordertype_2') {
          return;
        } else {
          minPrice = Math.min(+element.mvproduct_price, minPrice);

          if (element.hasOwnProperty('mvproduct_discounted_price')) {
            if (
              element.hasOwnProperty('mvproduct_smartship_discounted_price')
            ) {
              discountPrice =
                +element.mvproduct_smartship_discounted_price >
                +element.mvproduct_discounted_price
                  ? +element.mvproduct_discounted_price
                  : +element.mvproduct_smartship_discounted_price;
            } else {
              discountPrice = +element.mvproduct_discounted_price;
            }
          } else {
            if (
              element.hasOwnProperty('mvproduct_smartship_discounted_price')
            ) {
              discountPrice = +element.mvproduct_smartship_discounted_price;
            }
          }
        }
      });
    }
    return { price: minPrice, discount: discountPrice };
  }

  getPriceAfterSmartshipDiscount(variations: any) {
    let minPrice = Number.MAX_SAFE_INTEGER;

    if (variations) {
      Object.values(variations).forEach((element: any) => {
        if (element.mvproduct_ordertype === 'ordertype_2') {
          if (+element.mvproduct_price < minPrice) {
            minPrice = +element.mvproduct_price;
          }
        }
      });
    }

    return minPrice;
  }

  getMvpAttributeValues(object: any): any[] {
    if (object !== undefined) {
      return Object.values(object);
    } else {
      return [];
    }
  }

  getProductOrderType(product: any) {
    const tempOrderType: any[] = [];

    const availableVariations = Object.values(product.mvp_variations).filter(
      (variation: any) => !(variation.mvproduct_hide_variation === 'on')
    );

    availableVariations.forEach((val: any) => {
      if (val.mvproduct_ordertype === 'ordertype_1') {
        const order1Found = tempOrderType.some(
          (el: any) => el.orderType === 'ordertype_1'
        );
        if (!order1Found) {
          tempOrderType.push({
            orderType: 'ordertype_1',
            orderValue: 'One-time purchase',
            productPrice: val.mvproduct_price,
          });
        }
      }
      if (val.mvproduct_ordertype === 'ordertype_3') {
        const order3Found = tempOrderType.some(
          (el: any) => el.orderType === 'ordertype_3'
        );
        if (!order3Found) {
          tempOrderType.push({
            orderType: 'ordertype_3',
            orderValue: 'Subscribe & save',
            productPrice: val.mvproduct_price,
          });
        }
      }
    });
    return tempOrderType;
  }

  getCategory(tagsOrCategories: any[], categorySlug: string) {
    let isParentCategory = false;
    let categoryInfo: any = {};

    if (tagsOrCategories.length !== 0) {
      tagsOrCategories.forEach((element: any) => {
        if (element.slug === categorySlug) {
          isParentCategory = true;
          categoryInfo = element;
        }
      });
      if (!isParentCategory) {
        tagsOrCategories.forEach((parent: any) => {
          if (parent.hasOwnProperty('child_categories')) {
            parent.child_categories.forEach((child: any) => {
              if (child.slug === categorySlug) {
                categoryInfo = child;
              }
            });
          }
        });
      }
    }
    return { isParent: isParentCategory, category: categoryInfo };
  }

  sortByAlphabet(data: any[]) {
    return data.sort((a: any, b: any) =>
      a.post_title > b.post_title ? 1 : -1
    );
  }

  sortByPrice(data: any[]) {
    return data.sort((a: any, b: any) => {
      const priceA =
        this.getProductPrice(a.mvp_variations).discount !== 0
          ? this.getProductPrice(a.mvp_variations).discount
          : this.getProductPrice(a.mvp_variations).price;

      const priceB =
        this.getProductPrice(b.mvp_variations).discount !== 0
          ? this.getProductPrice(b.mvp_variations).discount
          : this.getProductPrice(b.mvp_variations).price;

      if (priceA < priceB) {
        return -1;
      }
      if (priceA > priceB) {
        return 1;
      }
      return 0;
    });
  }

  sortBySmartshipDiscount(data: any[]) {
    return data.sort((a: any, b: any) => {
      const priceA = this.getPriceAfterSmartshipDiscount(a.mvp_variations);

      const priceB = this.getPriceAfterSmartshipDiscount(b.mvp_variations);

      if (priceA < priceB) {
        return -1;
      }
      if (priceA > priceB) {
        return 1;
      }
      return 0;
    });
  }

  getPageSlug(productsData: any, url: string, elementID: number) {
    let pageSlug = '';

    if (url === 'product') {
      productsData.list.forEach((product: any) => {
        if (product.ID === elementID) {
          pageSlug = product.post_name;
        }
      });
    } else if (url === 'page') {
      productsData.page.forEach((product: any) => {
        if (product.id === elementID) {
          pageSlug = product.slug;
        }
      });
    } else {
      let searchList = [];

      if (url === 'category') {
        searchList = Object.values(productsData.parent_category);
      }
      if (url === 'tag') {
        searchList = productsData.product_tag;
      }

      if (searchList.length > 0) {
        searchList.forEach((product: any) => {
          if (product.term_id === elementID) {
            pageSlug = product.slug;
          } else {
            if (product.hasOwnProperty('child_categories')) {
              product.child_categories.forEach((child: any) => {
                if (child.term_id === elementID) {
                  pageSlug = child.slug;
                }
              });
            }
          }
        });
      }
    }
    return pageSlug;
  }
}
