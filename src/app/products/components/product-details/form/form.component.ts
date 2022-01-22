import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionLike } from 'rxjs';
import { AppDataService } from 'src/app/shared/services/app-data.service';
import { AppSeoService } from 'src/app/shared/services/app-seo.service';
import { AppUtilityService } from 'src/app/shared/services/app-utility.service';
import { SidebarDataService } from 'src/app/sidebar/services/sidebar-data.service';
import { environment } from 'src/environments/environment';
import { ProductsDataService } from '../../../services/products-data.service';
import { ProductsUtilityService } from '../../../services/products-utility.service';
declare var gallerySliderJS: any;
declare var $: any;
declare var tooltipJS: any;

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit, OnDestroy {
  selectedLanguage = '';
  selectedCountry = '';
  refCode = '';
  products: any[] = [];
  product: any = {};
  productOrderType: any[] = [];
  attrItem1 = '';
  attrItem2 = '';
  mvproductOrdertype = '';
  productVariation: any = {};
  productQuantity = 1;
  productDiscountPrice = 0;
  smartshipDiscountPrice = 0;
  productsData: any = {};
  productImages: any[] = [];
  defAttrItem1 = '';
  defAttrItem2 = '';
  defMvproductOrdertype = '';
  outOfStockServingsName: any[] = [];
  outOfStockCaffeineState: any[] = [];
  servings: any[] = [];
  isSmartShipDiscount = false;
  shippingNote = '';
  currencySymbol = '$';
  parentCategory: any = {};
  childCategory: any = {};
  isProductForPromoter = false;
  splicedProductOrderType: any[] = [];
  subscriptions: SubscriptionLike[] = [];
  attribute1 = '';
  attribute2 = '';
  isAllVariationOutOfStock = false;
  defaultLanguage = '';
  isStaging: boolean;
  wistiaHTML = '';
  productDiscountPercent = 0;
  smartshipDiscountPercent = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: AppDataService,
    private utilityService: AppUtilityService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private productsDataService: ProductsDataService,
    private productsUtilityService: ProductsUtilityService,
    private sidebarDataService: SidebarDataService,
    private seoService: AppSeoService,
    private appUtilityService: AppUtilityService
  ) {
    this.isStaging = environment.isStaging;
  }

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getSelectedCountry();
    this.getQueryParams();
  }

  loadTooltip() {
    $(document).ready(() => {
      tooltipJS();
    });
  }

  /* --------- product section ------------- */
  getSelectedLanguage() {
    this.subscriptions.push(
      this.dataService.currentSelectedLanguage.subscribe((language: string) => {
        this.selectedLanguage = language;
        this.translate.use(this.selectedLanguage);

        this.getProducts();
      })
    );
  }

  getSelectedCountry() {
    this.subscriptions.push(
      this.dataService.currentSelectedCountry.subscribe((country: string) => {
        this.selectedCountry = country;
      })
    );
  }

  getQueryParams() {
    if (this.isStaging) {
      this.route.queryParamMap.subscribe((params) => {
        const refCode = params.get('ref');
        if (refCode !== null) {
          this.refCode = refCode;
        }
      });
    } else {
      this.subscriptions.push(
        this.dataService.currentReferrerData.subscribe((referrer: any) => {
          if (referrer) {
            this.refCode = referrer.code;
          }
        })
      );
    }
  }

  getProducts() {
    this.subscriptions.push(
      this.productsDataService.currentProductsData.subscribe(
        (productsData: any) => {
          if (productsData) {
            this.defaultLanguage = productsData.default_lang;

            this.productsData = productsData;
            this.products = productsData.list;
            this.getProduct();
          }
        }
      )
    );
  }

  getCurrencySymbol() {
    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;
      this.currencySymbol =
        productsSettings.exchange_rate !== ''
          ? productsSettings.currency_symbol
          : '$';
    }
  }

  getProduct() {
    this.subscriptions.push(
      this.activatedRoute.params.subscribe((params) => {
        this.product = {};

        if (this.products.length !== 0) {
          this.products.forEach((product: any) => {
            if (product.post_name === params['id']) {
              this.product = product;
              this.productOrderType = this.getProductOrderType(this.product);
              this.attrItem1 = '';
              this.attrItem2 = '';
              this.mvproductOrdertype = '';
              this.productVariation = {};
              this.productQuantity = 1;
              this.productDiscountPrice = 0;
              this.smartshipDiscountPrice = 0;
              this.productImages = [];
              this.defAttrItem1 = '';
              this.defAttrItem2 = '';
              this.defMvproductOrdertype = '';
              this.outOfStockServingsName = [];
              this.outOfStockCaffeineState = [];
              this.servings = [];
              this.subscriptions = [];
              this.isSmartShipDiscount = false;
              this.shippingNote = '';
              this.currencySymbol = '$';
              this.parentCategory = {};
              this.childCategory = {};
              this.isProductForPromoter = false;
              this.splicedProductOrderType = [];
              this.attribute1 = '';
              this.attribute2 = '';
              this.isAllVariationOutOfStock = false;
              this.wistiaHTML = '';
              this.productDiscountPercent = 0;
              this.smartshipDiscountPercent = 0;

              this.getCurrencySymbol();
              this.setAttributes(this.product);
              this.getProductImages(this.product);
              this.getDefaultSelection(this.product);
              this.getOutOfStockServings(this.product);
              this.getServings(this.product);
              this.getHideProductDelivery();
              this.getShippingNote(this.product);
              this.getCategory(this.product);
              this.getChildCategory(this.product);
              this.checkProductForPromoter(this.product);
              this.getWistiaVideoHTML();
              this.loadTooltip();
            }
          });
        }

        this.setSeo();
      })
    );
  }

  setAttributes(product: any) {
    if (product) {
      const attributes: any[] = Object.keys(product.mvp_attributes);
      this.attribute1 = attributes[0];
      if (attributes.length > 1) {
        this.attribute2 = attributes[1];
      }
    }
  }

  getHideProductDelivery() {
    let tempOrderType = this.productOrderType;
    let allOrderTypeForSelectedVariation = new Set<string>();

    if (Object.entries(this.product).length !== 0) {
      const availableVariations = Object.values(
        this.product.mvp_variations
      ).filter(
        (variation: any) => !(variation.mvproduct_hide_variation === 'on')
      );
      availableVariations.forEach((variation: any) => {
        Object.entries(variation).forEach((varItem: any[]) => {
          if (varItem[0] === this.attribute1) {
            if (varItem[1] === this.attrItem1) {
              if (this.attribute2 !== '') {
                Object.entries(variation).forEach((varItem2: any[]) => {
                  if (varItem2[0] === this.attribute2) {
                    if (varItem2[1] === this.attrItem2) {
                      allOrderTypeForSelectedVariation.add(
                        variation.mvproduct_ordertype
                      );
                    }
                  }
                });
              } else {
                allOrderTypeForSelectedVariation.add(
                  variation.mvproduct_ordertype
                );
              }
            }
          }
        });
      });
    }

    if (!allOrderTypeForSelectedVariation.has('ordertype_3')) {
      tempOrderType = tempOrderType.filter(
        (order: any) => !(order.orderType === 'ordertype_3')
      );
    }
    this.splicedProductOrderType = tempOrderType;
    this.selectDelivery(this.splicedProductOrderType);
  }

  checkProductForPromoter(product: any) {
    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;
      this.isProductForPromoter =
        productsSettings.promoter_open === 'on' &&
        product.mvproduct_forpromoter === 'on'
          ? true
          : false;
    }
  }

  getCategory(product: any) {
    if (product) {
      if (this.productsData.hasOwnProperty('parent_category')) {
        let parentTermId = 0;
        product.categories.forEach((category: any) => {
          if (category.parent !== 0) {
            parentTermId = category.parent;
          }
        });
        const parentCategories: any[] = Object.values(
          this.productsData.parent_category
        );

        let categorySlug = '';
        parentCategories.forEach((parent: any) => {
          if (parent.term_id === parentTermId) {
            categorySlug = parent.slug;
          }
        });

        const categoryInfo = this.productsUtilityService.getCategory(
          parentCategories,
          categorySlug
        );
        if (categoryInfo.isParent) {
          this.parentCategory = categoryInfo.category;
        }
      }
    }
  }

  getChildCategory(product: any) {
    if (product) {
      product.categories.forEach((category: any) => {
        if (!category.slug.includes('shop-all')) {
          this.childCategory = category;
        }
      });
    }
  }

  getShippingNote(product: any) {
    const defaultNote =
      this.productsData.general_settings.default_shipping_note_text;
    const defaultNoteStatus =
      this.productsData.general_settings.default_shipping_note;

    if (product) {
      this.shippingNote =
        product.mvproduct_shipping_popup_note !== ''
          ? product.mvproduct_shipping_popup_note
          : defaultNoteStatus === 1
          ? defaultNote
          : '';
    }
  }

  isSoldOut(product: any) {
    if (product) {
      if (product.mvproduct_is_selling_closed === 'on') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getSoldOutText(product: any) {
    let soldOutText = '';

    if (product) {
      if (product.mvproduct_is_selling_closed === 'on') {
        if (product.mvproduct_selling_closed_text !== '') {
          soldOutText = product.mvproduct_selling_closed_text;
        } else {
          this.translate.get('currently-sold-out').subscribe((res: string) => {
            soldOutText = res;
          });
        }
      }
    }

    return soldOutText;
  }

  getServings(product: any) {
    if (product.mvp_attributes) {
      if (product.mvp_attributes !== undefined) {
        const servings = Object.values(product.mvp_attributes);

        const tempServingsArray: any[] = [];
        servings.forEach((serving: any) => {
          const tempAttributesArray: any[] = [];

          Object.entries(serving.attribute_items.items).forEach(
            (attribute: any) => {
              if (
                attribute[1].mvproduct_attribute_item !== '' &&
                this.isAttributePresentInVariation(product, attribute[0])
              ) {
                tempAttributesArray.push({
                  attrKey: attribute[0],
                  attrName: attribute[1].mvproduct_attribute_item,
                });
              }
            }
          );
          tempServingsArray.push({
            servingTitle: serving.mvproduct_attribute_title,
            servingAttributes: tempAttributesArray,
          });
        });
        this.servings = tempServingsArray;
        this.selectServing(this.servings);
      }
    }
  }

  isAttributePresentInVariation(product: any, attrKey: string) {
    let isAttrFound = false;

    const availableVariations = Object.values(product.mvp_variations).filter(
      (variation: any) => !(variation.mvproduct_hide_variation === 'on')
    );

    availableVariations.forEach((availableVar: any) => {
      Object.entries(availableVar).forEach((varItem: any[]) => {
        if (varItem[0] === this.attribute1) {
          if (varItem[1] === attrKey) {
            isAttrFound = true;
          }
        }
        if (this.attribute2 !== '') {
          if (varItem[0] === this.attribute2) {
            if (varItem[1] === attrKey) {
              isAttrFound = true;
            }
          }
        }
      });
    });
    return isAttrFound;
  }

  getOutOfStockServings(product: any) {
    const availableVariations = Object.values(product.mvp_variations).filter(
      (variation: any) => !(variation.mvproduct_hide_variation === 'on')
    );
    availableVariations.forEach((variation: any) => {
      if (variation.mvproduct_outof_stock === 'on') {
        Object.entries(variation).forEach((varItem: any[]) => {
          if (varItem[0] === this.attribute1) {
            if (
              !this.outOfStockServingsName.some(
                (item: string) => item === varItem[1]
              )
            ) {
              this.outOfStockServingsName.push(varItem[1]);
            }
          }
          if (this.attribute2 !== '') {
            if (varItem[0] === this.attribute2) {
              if (
                !this.outOfStockCaffeineState.some(
                  (item: string) => item === varItem[1]
                )
              ) {
                this.outOfStockCaffeineState.push(varItem[1]);
              }
            }
          }
        });
      }
    });
  }

  getDefaultSelection(product: any) {
    if (product.hasOwnProperty('mvproduct_default_var')) {
      if (Object.entries(this.product).length !== 0) {
        const availableVariations = Object.values(
          product.mvp_variations
        ).filter(
          (variation: any) => !(variation.mvproduct_hide_variation === 'on')
        );
        availableVariations.forEach((variation: any) => {
          if (variation.prod_var_unique_id === product.mvproduct_default_var) {
            Object.entries(variation).forEach((varItem: any[]) => {
              if (varItem[0] === this.attribute1) {
                this.defAttrItem1 = varItem[1];
              }
              if (this.attribute2 !== '') {
                if (varItem[0] === this.attribute2) {
                  this.defAttrItem2 = varItem[1];
                }
              }
            });
            this.defMvproductOrdertype = variation.mvproduct_ordertype;
          }
        });
      }
    }
  }

  getProductImages(product: any) {
    if (product.mvproduct_custom_gallery) {
      const tempImages = product.mvproduct_custom_gallery.split(',');
      this.productImages = tempImages;

      const bannerSlick = $(
        '.slider.sk-product-slider-for.sk-product__main-img.slick-initialized.slick-slider'
      );

      const bannerPreviewSlick = $(
        '.sk-product__flavor-list.slider.sk-product-slider-nav.slick-initialized.slick-slider'
      );

      if (bannerSlick.length > 0) {
        $('.sk-product-slider-for').slick('unslick');
      }

      if (bannerPreviewSlick.length > 0) {
        $('.sk-product-slider-nav').slick('unslick');
      }

      $(document).ready(() => {
        setTimeout(() => {
          gallerySliderJS(this.productImages.length);

          $('.sk-product-slider-for').slick('setPosition');
        }, 0);
      });
    }
  }

  /* --------- delivery options section ------------- */
  onClickLearnMore() {
    this.sidebarDataService.changeSidebarName('delivery-options');
    $('.drawer').drawer('open');
  }

  /* ------- product servings section ------------- */
  trackByAttrKey(attr: any) {
    return attr.attrKey;
  }

  onServingsSelect(event: any, servingIndex: number) {
    if (servingIndex === 0) {
      this.attrItem1 = event.target.value;
    }
    if (servingIndex === 1) {
      this.attrItem2 = event.target.value;
    }
    this.getHideProductDelivery();
    this.getProductVariation();
    this.getProductDiscountForVariation();
  }

  checkCurrentAttr2OutOfStock(attributeItem2: string) {
    let isAttr2OutOfStock = false;
    const availableVariations = Object.values(
      this.product.mvp_variations
    ).filter(
      (variation: any) => !(variation.mvproduct_hide_variation === 'on')
    );

    availableVariations.forEach((variation: any) => {
      Object.entries(variation).forEach((varItem: any[]) => {
        if (varItem[0] === this.attribute2) {
          if (varItem[1] === attributeItem2) {
            if (variation.mvproduct_ordertype === this.mvproductOrdertype) {
              if (variation.mvproduct_outof_stock === 'on') {
                Object.entries(variation).forEach((varItem2: any[]) => {
                  if (varItem2[0] === this.attribute1) {
                    if (varItem2[1] === this.attrItem1) {
                      isAttr2OutOfStock = true;
                    }
                  }
                });
              }
            }
          }
        }
      });
    });
    return isAttr2OutOfStock;
  }

  checkAllAttr1OutOfStock(attributeItem1: string) {
    let outOfStockCount = 0;
    const availableVariations = Object.values(
      this.product.mvp_variations
    ).filter(
      (variation: any) => !(variation.mvproduct_hide_variation === 'on')
    );
    availableVariations.forEach((variation: any) => {
      Object.entries(variation).forEach((varItem: any[]) => {
        if (varItem[0] === this.attribute1) {
          if (varItem[1] === attributeItem1) {
            if (variation.mvproduct_ordertype === 'ordertype_1') {
              if (variation.mvproduct_outof_stock === '') {
                outOfStockCount++;
              }
            }
          }
        }
      });
    });
    return outOfStockCount > 0 ? false : true;
  }

  selectServing(servings: any[]) {
    if (servings[0].servingAttributes.length === 1) {
      if (
        !this.checkAllAttr1OutOfStock(servings[0].servingAttributes[0].attrKey)
      ) {
        this.attrItem1 = servings[0].servingAttributes[0].attrKey;
      }
    }

    if (servings[0].servingAttributes.length === 2) {
      servings[0].servingAttributes.forEach((attribute: any) => {
        if (this.outOfStockServingsName.length > 0) {
          this.outOfStockServingsName.forEach((item: string) => {
            if (attribute.attrKey !== item) {
              this.attrItem1 = attribute.attrKey;
            }
          });
        } else {
          if (attribute.attrKey === this.defAttrItem1) {
            this.attrItem1 = attribute.attrKey;
          } else {
            this.attrItem1 = servings[0].servingAttributes[0].attrKey;
          }
        }
      });
    }
    if (servings[0].servingAttributes.length > 2) {
      servings[0].servingAttributes.forEach((attribute: any) => {
        this.outOfStockServingsName.forEach((item: string) => {
          if (
            attribute.attrKey !== item &&
            attribute.attrKey === this.defAttrItem1
          ) {
            this.attrItem1 = attribute.attrKey;
          }
        });
      });
    }

    if (servings.length > 1) {
      if (servings[1].servingAttributes.length === 1) {
        if (
          !this.outOfStockCaffeineState.includes(
            servings[1].servingAttributes[0].attrKey
          )
        ) {
          this.attrItem2 = servings[1].servingAttributes[0].attrKey;
        }
      }

      if (servings[1].servingAttributes.length === 2) {
        servings[1].servingAttributes.forEach((attribute: any) => {
          if (this.outOfStockCaffeineState.length > 0) {
            this.outOfStockCaffeineState.forEach((item: string) => {
              if (
                attribute.attrKey !== item &&
                !this.checkCurrentAttr2OutOfStock(attribute.attrKey)
              ) {
                this.attrItem2 = attribute.attrKey;
              }
            });
          } else {
            if (attribute.attrKey === this.defAttrItem2) {
              this.attrItem2 = attribute.attrKey;
            } else {
              this.attrItem2 = servings[1].servingAttributes[0].attrKey;
            }
          }
        });
      }

      if (servings[1].servingAttributes.length > 2) {
        servings[1].servingAttributes.forEach((attribute: any) => {
          this.outOfStockCaffeineState.forEach((item: string) => {
            if (
              attribute.attrKey !== item &&
              attribute.attrKey === this.defAttrItem2
            ) {
              this.attrItem2 = attribute.attrKey;
            }
          });
        });
      }
    }
    this.getProductVariation();
    this.getProductDiscountForVariation();
  }

  /* -------- out of stock section ----------- */
  isItemOutOfStock(
    currentAttrKey: any,
    attrArray: any[],
    attributeIndex: number
  ) {
    let isOutOfStock = false;
    if (attributeIndex === 0) {
      isOutOfStock = this.checkAllAttr1OutOfStock(currentAttrKey)
        ? true
        : false;
    }

    if (attributeIndex === 1) {
      let isAttr2OutOfStock = this.checkCurrentAttr2OutOfStock(currentAttrKey);

      if (isAttr2OutOfStock) {
        isOutOfStock = true;
        if (attrArray.length === 2) {
          attrArray.forEach((attribute: any) => {
            if (attribute.attrKey !== currentAttrKey) {
              if (!this.checkCurrentAttr2OutOfStock(attribute.attrKey)) {
                this.attrItem2 = attribute.attrKey;
              }
            }
          });
        }
      } else {
        isOutOfStock = false;
      }
    }
    return isOutOfStock;
  }

  checkCurrentVariationAvailable(currentAttrKey: any) {
    let isVariationFound = false;
    const availableVariations = Object.values(
      this.product.mvp_variations
    ).filter(
      (variation: any) => !(variation.mvproduct_hide_variation === 'on')
    );

    availableVariations.forEach((variation: any) => {
      Object.entries(variation).forEach((varItem: any[]) => {
        if (varItem[0] === this.attribute2) {
          if (varItem[1] === currentAttrKey) {
            if (variation.mvproduct_ordertype === this.mvproductOrdertype) {
              Object.entries(variation).forEach((varItem2: any[]) => {
                if (varItem2[0] === this.attribute1) {
                  if (varItem2[1] === this.attrItem1) {
                    isVariationFound = true;
                  }
                }
              });
            }
          }
        }
      });
    });

    return isVariationFound;
  }

  isVariationAvailable(currentAttrKey: any) {
    const isAttr2Available =
      this.checkCurrentVariationAvailable(currentAttrKey);

    return isAttr2Available;
  }

  /* -------- product delivery section ----------- */
  getProductOrderType(value: any) {
    return this.productsUtilityService.getProductOrderType(value);
  }

  onOrderTypeSelect(event: any) {
    this.mvproductOrdertype = event.target.value;
    this.getProductVariation();
    this.getProductDiscountForVariation();
  }

  selectDelivery(productOrderType: any[]) {
    if (productOrderType.length === 1) {
      this.mvproductOrdertype = productOrderType[0].orderType;
    } else {
      if (productOrderType.length !== 0) {
        if (this.defMvproductOrdertype === '') {
          this.mvproductOrdertype = 'ordertype_3';
        } else {
          productOrderType.forEach((element: any) => {
            if (element.orderType === this.defMvproductOrdertype) {
              this.mvproductOrdertype = element.orderType;
            }
          });
        }
      }
    }
    this.getProductVariation();
    this.getProductDiscountForVariation();
  }

  /* -------- product variation section ----------- */
  getProductVariation() {
    this.productVariation = {};

    this.isAllVariationOutOfStock = this.checkAllAttr1OutOfStock(
      this.attrItem1
    );

    if (!this.isAllVariationOutOfStock) {
      if (Object.entries(this.product).length !== 0) {
        const availableVariations = Object.values(
          this.product.mvp_variations
        ).filter(
          (variation: any) => !(variation.mvproduct_hide_variation === 'on')
        );

        availableVariations.forEach((variation: any) => {
          Object.entries(variation).forEach((varItem1: any[]) => {
            if (varItem1[0] === this.attribute1) {
              if (varItem1[1] === this.attrItem1) {
                if (this.attribute2 !== '') {
                  Object.entries(variation).forEach((varItem2: any[]) => {
                    if (varItem2[0] === this.attribute2) {
                      if (varItem2[1] === this.attrItem2) {
                        if (
                          variation.mvproduct_ordertype ===
                          this.mvproductOrdertype
                        ) {
                          this.productVariation = variation;
                        }
                      }
                    }
                  });
                } else {
                  if (
                    variation.mvproduct_ordertype === this.mvproductOrdertype
                  ) {
                    this.productVariation = variation;
                  }
                }
              }
            }
          });
        });
      }
    }
  }

  getProductDiscountForVariation() {
    const productOrderType =
      this.mvproductOrdertype === 'ordertype_1'
        ? this.mvproductOrdertype
        : 'ordertype_1';

    if (Object.entries(this.product).length !== 0) {
      const availableVariations = Object.values(
        this.product.mvp_variations
      ).filter(
        (variation: any) => !(variation.mvproduct_hide_variation === 'on')
      );
      availableVariations.forEach((variation: any) => {
        Object.entries(variation).forEach((varItem1: any[]) => {
          if (varItem1[0] === this.attribute1) {
            if (varItem1[1] === this.attrItem1) {
              if (this.attribute2 !== '') {
                Object.entries(variation).forEach((varItem2: any[]) => {
                  if (varItem2[0] === this.attribute2) {
                    if (varItem2[1] === this.attrItem2) {
                      if (variation.mvproduct_ordertype === productOrderType) {
                        if (
                          variation.hasOwnProperty('mvproduct_discounted_price')
                        ) {
                          this.productDiscountPrice =
                            +variation.mvproduct_discounted_price;

                          this.productDiscountPercent =
                            +variation.percent_of_discount;
                        } else {
                          this.productDiscountPrice = 0;

                          this.productDiscountPercent = 0;
                        }
                        if (
                          variation.hasOwnProperty(
                            'mvproduct_smartship_discounted_price'
                          )
                        ) {
                          this.isSmartShipDiscount = true;
                          this.smartshipDiscountPrice =
                            +variation.mvproduct_smartship_discounted_price;

                          this.smartshipDiscountPercent =
                            +variation.percent_of_smartship_discount;
                        } else {
                          this.isSmartShipDiscount = false;
                          this.smartshipDiscountPrice = 0;

                          this.smartshipDiscountPercent = 0;
                        }
                      }
                    }
                  }
                });
              } else {
                if (variation.mvproduct_ordertype === productOrderType) {
                  if (variation.hasOwnProperty('mvproduct_discounted_price')) {
                    this.productDiscountPrice =
                      +variation.mvproduct_discounted_price;

                    this.productDiscountPercent =
                      +variation.percent_of_discount;
                  } else {
                    this.productDiscountPrice = 0;

                    this.productDiscountPercent = 0;
                  }
                  if (
                    variation.hasOwnProperty(
                      'mvproduct_smartship_discounted_price'
                    )
                  ) {
                    this.isSmartShipDiscount = true;
                    this.smartshipDiscountPrice =
                      +variation.mvproduct_smartship_discounted_price;

                    this.smartshipDiscountPercent =
                      +variation.percent_of_smartship_discount;
                  } else {
                    this.isSmartShipDiscount = false;
                    this.smartshipDiscountPrice = 0;

                    this.smartshipDiscountPercent = 0;
                  }
                }
              }
            }
          }
        });
      });
    }
  }

  getCartPriceForVariation(orderType: string) {
    let priceObject = {};
    if (orderType === 'ordertype_3') {
      priceObject = {
        oneTime: this.getDeliveryPrice('ordertype_1'),
        everyMonth: this.getDeliveryPrice('ordertype_2'),
      };
    } else {
      priceObject = { oneTime: this.getDeliveryPrice('ordertype_1') };
    }
    return priceObject;
  }

  getProductPriceAndStatus() {
    let productPrice: any;
    let productStatus: boolean;

    if (this.productDiscountPrice === 0) {
      if (this.isSmartShipDiscount) {
        productPrice = this.getNumFormat(
          this.productQuantity *
            this.getExchangedPrice(this.smartshipDiscountPrice)
        );
        productStatus = true;
      } else {
        productPrice = this.getNumFormat(
          this.productQuantity *
            this.getExchangedPrice(+this.productVariation.mvproduct_price)
        );
        productStatus = false;
      }
    } else {
      if (this.isSmartShipDiscount) {
        const maximumDiscount =
          this.productDiscountPrice >= this.smartshipDiscountPrice
            ? this.smartshipDiscountPrice
            : this.productDiscountPrice;

        productPrice = this.getNumFormat(
          this.productQuantity * this.getExchangedPrice(maximumDiscount)
        );
        productStatus = true;
      } else {
        productPrice = this.getNumFormat(
          this.productQuantity *
            this.getExchangedPrice(this.productDiscountPrice)
        );
        productStatus = true;
      }
    }
    return { price: productPrice, status: productStatus };
  }

  getDeliveryPrice(orderType: string) {
    let variationPrice = '';
    if (Object.entries(this.product).length !== 0) {
      const availableVariations = Object.values(
        this.product.mvp_variations
      ).filter(
        (variation: any) => !(variation.mvproduct_hide_variation === 'on')
      );
      availableVariations.forEach((variation: any) => {
        Object.entries(variation).forEach((varItem1: any[]) => {
          if (varItem1[0] === this.attribute1) {
            if (varItem1[1] === this.attrItem1) {
              if (this.attribute2 !== '') {
                Object.entries(variation).forEach((varItem2: any[]) => {
                  if (varItem2[0] === this.attribute2) {
                    if (varItem2[1] === this.attrItem2) {
                      if (variation.mvproduct_ordertype === orderType) {
                        variationPrice = variation.mvproduct_price;
                      }
                    }
                  }
                });
              } else {
                if (variation.mvproduct_ordertype === orderType) {
                  variationPrice = variation.mvproduct_price;
                }
              }
            }
          }
        });
      });
    }
    return +variationPrice;
  }

  getExchangedPrice(price: number) {
    let finalPrice = 0;

    if (this.productsData) {
      const productsSettings = this.productsData.product_settings;
      const exchangedPrice =
        productsSettings.exchange_rate !== ''
          ? +productsSettings.exchange_rate * price
          : price;

      finalPrice =
        productsSettings.tax_rate !== '' && +productsSettings.tax_rate !== 0
          ? exchangedPrice + (exchangedPrice * +productsSettings.tax_rate) / 100
          : exchangedPrice;
    }
    return finalPrice;
  }

  getNumFormat(num: number) {
    if (
      isNaN(num) ||
      Number.POSITIVE_INFINITY === num ||
      Number.NEGATIVE_INFINITY === num
    ) {
      return 0;
    }
    if (num % 1 === 0) {
      return num;
    } else {
      return num.toFixed(2);
    }
  }

  getSavedPrice() {
    const oneTimePrice = this.getDeliveryPrice('ordertype_1');
    const everyMonthPrice = this.getDeliveryPrice('ordertype_2');
    return +this.getNumFormat(
      this.getExchangedPrice(oneTimePrice - everyMonthPrice)
    );
  }

  /*--------- product quantity section -------- */
  onClickQuantityPlus() {
    if (this.productQuantity < this.productVariation.mvproduct_quantity) {
      this.productQuantity++;
    }
  }

  onClickQuantityMinus() {
    if (this.productQuantity > 1) {
      this.productQuantity--;
    }
  }

  /* --------- add to cart section ------------- */
  onClickAddToCart() {
    const isInvalidSupplement = this.appUtilityService.showPurchaseWarningPopup(
      this.selectedCountry,
      this.selectedLanguage,
      false
    );

    const cartDataWithLanguages: any[] = [];

    cartDataWithLanguages.push({
      country: this.selectedCountry.toLowerCase(),
      language: this.selectedLanguage,
      orderType: this.mvproductOrdertype,
      cart: {
        productID: this.product.ID,
        productName: this.product.post_title,
        productImageUrl: this.product.post_home_thumb_url,
        servingsName: this.getServingsAndCaffeineStateName(this.product)
          .servings,
        caffeineState: this.getServingsAndCaffeineStateName(this.product)
          .caffeine,
        totalQuantity: this.productVariation.mvproduct_quantity,
        quantity: this.productQuantity,
        price: this.getCartPriceForVariation(this.mvproductOrdertype),
        discountPrice: this.productDiscountPrice,
        productSku: this.getProductSku(
          this.productVariation.mvproduct_sku,
          this.mvproductOrdertype
        ),
        discountPercent: this.productDiscountPercent,
        smartshipDiscountPrice: this.smartshipDiscountPrice,
        smartshipDiscountPercent: this.smartshipDiscountPercent,
        discountType: this.getSkuBasedOfferStatus(
          this.getProductSku(
            this.productVariation.mvproduct_sku,
            this.mvproductOrdertype
          )
        ),
      },
    });

    if (isInvalidSupplement) {
      this.productsDataService.changePostName('purchase-modal');
      $('#PurchaseWarningModal').modal('show');
    } else {
      localStorage.setItem('DirectCheckout', JSON.stringify(false));
      this.dataService.setIsFromSmartshipStatus(false);

      const isProductHasSmartshipDiscount: boolean =
        this.isSmartShipDiscount && this.smartshipDiscountPrice !== 0
          ? true
          : false;

      const everyMonthCart = this.utilityService.getEveryMonthStorage(
        this.selectedCountry.toLowerCase(),
        this.selectedLanguage
      );

      if (this.isProductForPromoter) {
        if (this.selectedCountry !== 'GB' && this.selectedCountry !== 'IT') {
          cartDataWithLanguages.forEach((cartData: any) => {
            cartData.isPromoter = true;
          });
        }
      }

      if (
        (this.isProductForPromoter || isProductHasSmartshipDiscount) &&
        everyMonthCart.length === 0 &&
        this.mvproductOrdertype === 'ordertype_1'
      ) {
        this.sidebarDataService.setPromoterCartData(cartDataWithLanguages);
        this.productsDataService.changePostName('pruvit-modal-utilities');
        $('#joinAsPromoterModal').modal('show');
      } else {
        this.sidebarDataService.setCartData(cartDataWithLanguages);
        this.sidebarDataService.changeSidebarName('add-to-cart');

        const availableOffers: any[] = [];

        const cartOneTime = this.utilityService.getCurrentCart(
          cartDataWithLanguages
        ).oneTime;
        const cartEveryMonth = this.utilityService.getCurrentCart(
          cartDataWithLanguages
        ).everyMonth;

        if (this.productsData.hasOwnProperty('offer')) {
          this.productsData.offer.forEach((offer: any) => {
            if (offer.offer_type === 'cart_total') {
              const includeRegularDiscount =
                offer?.include_regular_discount === 'on' ? true : false;

              const cartTotalOfferFound = this.utilityService.isCartTotalOffer(
                includeRegularDiscount,
                +offer.price_over,
                +offer.price_under,
                cartDataWithLanguages
              );

              const isOfferSkuFound = this.getOfferSkuFoundStatus(
                offer,
                cartOneTime,
                cartEveryMonth
              );

              if (cartTotalOfferFound && !isOfferSkuFound) {
                availableOffers.push(offer);
              }
            }
            if (offer.offer_type === 'sku_purchase') {
              let skuBasedOfferFound = false;

              cartOneTime.forEach((cartOneTime: any) => {
                offer.qualify_sku.onetime.forEach((qualifiedOneTime: any) => {
                  if (
                    cartOneTime.cart.productSku.oneTime === qualifiedOneTime
                  ) {
                    skuBasedOfferFound = true;
                  }
                });
              });

              cartEveryMonth.forEach((cartEveryMonth: any) => {
                offer.qualify_sku.smartship.forEach(
                  (qualifiedSmartship: any) => {
                    if (
                      cartEveryMonth.cart.productSku.everyMonth ===
                      qualifiedSmartship
                    ) {
                      skuBasedOfferFound = true;
                    }
                  }
                );
              });

              const isOfferSkuFound = this.getOfferSkuFoundStatus(
                offer,
                cartOneTime,
                cartEveryMonth
              );

              if (skuBasedOfferFound && !isOfferSkuFound) {
                availableOffers.push(offer);
              }
            }
          });
        }

        if (availableOffers.length > 0) {
          this.dataService.setOfferArray(availableOffers, 0);

          this.productsDataService.changePostName('pruvit-modal-utilities');
          $('#special-offer').modal('show');
        } else {
          $('.drawer').drawer('open');
        }
      }
    }
  }

  getProductSku(productSku: string, orderType: string) {
    let skuObject = {};

    if (orderType === 'ordertype_3') {
      skuObject = {
        oneTime: this.getSkuNameIfIgnore('ordertype_1'),
        everyMonth: this.getSkuNameIfIgnore('ordertype_2'),
      };
    } else {
      skuObject = { oneTime: productSku };
    }
    return skuObject;
  }

  getSkuNameIfIgnore(orderType: string) {
    let skuName = '';
    if (Object.entries(this.product).length !== 0) {
      const availableVariations = Object.values(
        this.product.mvp_variations
      ).filter(
        (variation: any) => !(variation.mvproduct_hide_variation === 'on')
      );
      availableVariations.forEach((variation: any) => {
        Object.entries(variation).forEach((varItem1: any[]) => {
          if (varItem1[0] === this.attribute1) {
            if (varItem1[1] === this.attrItem1) {
              if (this.attribute2 !== '') {
                Object.entries(variation).forEach((varItem2: any[]) => {
                  if (varItem2[0] === this.attribute2) {
                    if (varItem2[1] === this.attrItem2) {
                      if (variation.mvproduct_ordertype === orderType) {
                        skuName = variation.mvproduct_sku;
                      }
                    }
                  }
                });
              } else {
                if (variation.mvproduct_ordertype === orderType) {
                  skuName = variation.mvproduct_sku;
                }
              }
            }
          }
        });
      });
    }
    return skuName;
  }

  getServingsAndCaffeineStateName(product: any) {
    let caffeineStateName = '';
    let servingsName = '';
    if (Object.entries(product).length !== 0) {
      Object.values(product.mvp_attributes).forEach((val: any) => {
        Object.entries(val.attribute_items.items).forEach((key: any) => {
          if (key[0] === this.attrItem1) {
            servingsName = key[1].mvproduct_attribute_item;
          }
          if (key[0] === this.attrItem2) {
            caffeineStateName = key[1].mvproduct_attribute_item;
          }
        });
      });
    }
    return { servings: servingsName, caffeine: caffeineStateName };
  }

  getWistiaVideoHTML() {
    const videoID = this.getWistiaVideoID();

    const watchTheVideoTranslation =
      this.product?.banner_link_label !== ''
        ? this.product?.banner_link_label
        : this.getWatchVideoTranslatedText();

    const tempWistiaHTML =
      '<span class="btn btn-brand-primary btn-large btn-icon btn-watch btn-watch-videopop wistia_embed wistia_async_' +
      videoID +
      ' popover=true popoverContent=link" style="display: inline;"> <span class="a-link link-hover"><i class="far fa-play-circle play-icon"></i>' +
      watchTheVideoTranslation +
      '</span></span>';

    this.wistiaHTML = videoID === '' ? '' : tempWistiaHTML;
  }

  getWistiaVideoID() {
    const videoLink =
      this.product?.banner_link_url !== ''
        ? this.product?.banner_link_url
        : this.product?.mvproduct_wistia_video_link;

    let videoID = '';

    if (videoLink) {
      if (videoLink.includes('home.wistia.com')) {
        videoID = videoLink.substring(videoLink.lastIndexOf('/') + 1);
      } else {
        videoID = videoLink;
      }
    }
    return videoID;
  }

  isPruvitTVPresent(videoLink: string) {
    if (videoLink) {
      if (videoLink.includes('pruvit.tv')) {
        return true;
      }
    }
    return false;
  }

  onClickPruvitTvVideo(videoLink: string) {
    this.dataService.setPruvitTvLink(videoLink);
    this.productsDataService.changePostName('pruvit-modal-utilities');
    $('#pruvitTVModal').modal('show');
  }

  getTranslatedText(orderType: string) {
    let translatedText = '';
    if (orderType === 'ordertype_1') {
      this.translate.get('onetime-purchase').subscribe((res: string) => {
        translatedText = res;
      });
    }
    if (orderType === 'ordertype_3') {
      this.translate.get('subscribe-and-save').subscribe((res: string) => {
        translatedText = res;
      });
    }
    return translatedText;
  }

  getWatchVideoTranslatedText() {
    let translatedText = '';
    switch (this.selectedLanguage) {
      case 'en':
        translatedText = 'Watch the video';
        break;
      case 'de':
        translatedText = 'Video ansehen';
        break;
      case 'es':
        translatedText = 'Ver el vídeo';
        break;
      case 'it':
        translatedText = 'Guarda il video';
        break;
      case 'zh-hans':
        translatedText = '观看影片';
        break;
      case 'zh-hant':
        translatedText = '觀看影片';
        break;
      default:
        translatedText = 'Watch the video';
        break;
    }
    return translatedText;
  }

  onClickCategory(categorySlug: string) {
    if (categorySlug) {
      const routeURL = '/category/' + categorySlug;
      this.utilityService.navigateToRoute(
        routeURL,
        this.selectedCountry,
        this.selectedLanguage,
        this.isStaging,
        this.refCode,
        this.defaultLanguage
      );
    }
  }

  onClickHome() {
    this.utilityService.navigateToRoute(
      '/',
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
  }

  setSeo() {
    if (
      !(
        this.product &&
        Object.keys(this.product).length === 0 &&
        this.product.constructor === Object
      )
    ) {
      this.seoService.updateTitle(this.product.post_title);
      this.seoService.updateDescription(
        this.product.mvproduct_banner_description
      );

      this.dataService.currentIsSubdomain.subscribe((status: boolean) => {
        if (!status) {
          this.seoService.updateRobots('index,follow');
        }
      });
    }
  }

  getSkuBasedOfferStatus(skuObj: any) {
    let skuBasedOfferFound = false;
    let cartTotalOfferFound = false;

    if (this.productsData.hasOwnProperty('offer')) {
      if (this.mvproductOrdertype === 'ordertype_1') {
        this.productsData.offer.forEach((offer: any) => {
          if (offer.offer_type === 'sku_purchase') {
            Object.entries(offer.product.discount.onetime).forEach(
              (oneTimeOffer: any[]) => {
                if (oneTimeOffer[0] === skuObj.oneTime) {
                  skuBasedOfferFound = true;
                }
              }
            );
          }
        });
      } else {
        this.productsData.offer.forEach((offer: any) => {
          if (offer.offer_type === 'sku_purchase') {
            Object.entries(offer.product.discount.smartship).forEach(
              (smartshipOffer: any[]) => {
                if (smartshipOffer[0] === skuObj.everyMonth) {
                  skuBasedOfferFound = true;
                }
              }
            );
          }
        });
      }

      if (this.mvproductOrdertype === 'ordertype_1') {
        this.productsData.offer.forEach((offer: any) => {
          if (offer.offer_type === 'cart_total') {
            Object.entries(offer.product.discount.onetime).forEach(
              (oneTimeOffer: any[]) => {
                if (oneTimeOffer[0] === skuObj.oneTime) {
                  cartTotalOfferFound = true;
                }
              }
            );
          }
        });
      } else {
        this.productsData.offer.forEach((offer: any) => {
          if (offer.offer_type === 'cart_total') {
            Object.entries(offer.product.discount.smartship).forEach(
              (smartshipOffer: any[]) => {
                if (smartshipOffer[0] === skuObj.everyMonth) {
                  cartTotalOfferFound = true;
                }
              }
            );
          }
        });
      }
    }

    return skuBasedOfferFound
      ? 'sku_purchase'
      : cartTotalOfferFound
      ? 'cart_total'
      : '';
  }

  getOfferSkuFoundStatus(
    offer: any,
    oneTimeCart: any[],
    everyMonthCart: any[]
  ) {
    const offeredSkus: any[] = [];
    let offeredSkuFound = false;

    const availableVariations = Object.values(
      offer.product.product_info.mvp_variations
    ).filter(
      (variation: any) => !(variation.mvproduct_hide_variation === 'on')
    );
    availableVariations.forEach((variation: any) => {
      offeredSkus.push(variation.mvproduct_sku);
    });

    oneTimeCart.forEach((cartOneTime: any) => {
      offeredSkus.forEach((sku: any) => {
        if (cartOneTime.cart.productSku.oneTime === sku) {
          offeredSkuFound = true;
        }
      });
    });

    everyMonthCart.forEach((cartEveryMonth: any) => {
      offeredSkus.forEach((sku: any) => {
        if (cartEveryMonth.cart.productSku.everyMonth === sku) {
          offeredSkuFound = true;
        }
      });
    });

    return offeredSkuFound;
  }

  onClickShopAll() {
    let shopAllSlug = '';
    const categories = Object.values(this.productsData.parent_category);

    categories.forEach((category: any) => {
      if (category.slug.includes('shop-all')) {
        shopAllSlug = category.slug;
      }
    });
    shopAllSlug = shopAllSlug === '' ? 'shop-all' : shopAllSlug;

    this.utilityService.navigateToRoute(
      '/category/' + shopAllSlug,
      this.selectedCountry,
      this.selectedLanguage,
      this.isStaging,
      this.refCode,
      this.defaultLanguage
    );
  }

  isBothPricesSame() {
    const discountPrice = +this.getProductPriceAndStatus().price;
    const originalPrice = +this.getNumFormat(
      this.productQuantity *
        this.getExchangedPrice(+this.productVariation?.mvproduct_price)
    );

    return discountPrice === originalPrice;
  }

  ngOnDestroy() {
    $('.drawer').drawer('destroy');
    this.subscriptions.forEach((element) => {
      element.unsubscribe();
    });
  }
}
