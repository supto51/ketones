// ----------------- Product Details -----------------
var productTabsJS = function () {
  // jquery for content navigation
  $(".sk-product__info-btn").click(function () {
    $(".sk-product__info-btn").removeClass("active");
    $(this).addClass("active");
  });

  $("#sk-product__info-list li button").on("click", function (e) {
    e.preventDefault();
    var page = $(this).data("page");

    $("#sk-product__info-details .sk-product__item-info:not('.display-none')")
      .stop()
      .fadeOut("fast", function () {
        $(this).addClass("display-none");

        $(
          '#sk-product__info-details .sk-product__item-info[data-page="' +
            page +
            '"]'
        )
          .fadeIn("slow")
          .removeClass("display-none");
      });
  });
};

// ----------------- Main Slick Slider  -----------------
var bannerSliderJS = function (dotsStatus) {
  $(".sk-main__banner-slider")
    .not(".slick-initialized")
    .slick({
      centerMode: true,
      dots: dotsStatus,
      centerPadding: "0px",
      infinite: false,
      slidesToShow: 1,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            arrows: true,
            centerMode: true,
            centerPadding: "20px",
            slidesToShow: 1,
          },
        },
        {
          breakpoint: 768,
          settings: {
            arrows: true,
            centerMode: true,
            centerPadding: "0px",
            slidesToShow: 1,
          },
        },
      ],
    });
};

// ---------- product details slider ------------
var gallerySliderJS = function (sliderLength) {
  $(".sk-product-slider-for").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: false,
    adaptiveHeight: true,
    infinite: false,
    useTransform: true,
    speed: 300,
  });

  $(".sk-product-slider-nav")
    .on("init", function (event, slick) {
      $(".sk-product-slider-nav .slick-slide.slick-current").addClass("active");
    })
    .slick({
      slidesToShow: sliderLength,
      slidesToScroll: 2,
      dots: false,
      focusOnSelect: false,
      infinite: false,
    });

  $(".sk-product-slider-for").on(
    "afterChange",
    function (event, slick, currentSlide) {
      $(".sk-product-slider-nav").slick("slickGoTo", currentSlide);
      var currrentNavSlideElem =
        '.sk-product-slider-nav .slick-slide[data-slick-index="' +
        currentSlide +
        '"]';
      $(".sk-product-slider-nav .slick-slide.active").removeClass("active");
      $(currrentNavSlideElem).addClass("active");
    }
  );

  $(".sk-product-slider-nav").on("click", ".slick-slide", function (event) {
    event.preventDefault();
    var goToSingleSlide = $(this).data("slick-index");

    $(".sk-product-slider-for").slick("slickGoTo", goToSingleSlide);
  });
};

// ----------- privacy policy scroll js ------------
$(window).scroll(function () {
  if ($("#provitNowDocScrollspy").length) {
    let mainNavLinks = document.querySelectorAll(
      "nav#provitNowDocScrollspy ul.provitNowDoc_sidenav li a"
    );

    let fromTop = window.scrollY;

    let endSelect = document.querySelector("#addendums");
    if (endSelect.offsetTop - 400 <= fromTop) {
      let topFixed = endSelect.offsetTop - 400;
      document
        .querySelector(".provitNowDoc_sidenav")
        .setAttribute("style", "position:absolute; top: " + topFixed + "px;");
    } else {
      document
        .querySelector(".provitNowDoc_sidenav")
        .setAttribute("style", "position:fixed; top: 190px;");
    }

    mainNavLinks.forEach((link) => {
      if (link.hash != "") {
        let section = document.querySelector(link.hash);
        if (section != null) {
          let prntList = link.parentNode;
          if (
            section.offsetTop <= fromTop &&
            section.offsetTop + section.offsetHeight > fromTop
          ) {
            if (!prntList.classList.contains("active")) {
              prntList.classList.add("active");
              if (prntList.classList.contains("parent-list")) {
                $(".provitNowDoc_sidenav").scrollTop(prntList.offsetTop);
              }
            }
          } else {
            if (prntList.classList.contains("active")) {
              prntList.classList.remove("active");
            }
          }
        }
      }
    });
  }
});

/* ----------- tag slider ------------ */
var tagSliderJS = function (tagSlug, sliderLength) {
  let finalSlides = sliderLength >= 3 ? 3 : sliderLength;

  $(".sk-category__products." + tagSlug).slick({
    infinite: false,
    slidesToShow: finalSlides,
    slidesToScroll: 1,
    autoplay: false,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 768,

        settings: {
          slidesToShow: 2,
        },
      },
    ],
  });
};

var leaderBoardJS = function () {
  var default_size = {
    w: 20,
    h: 15,
  };

  function calcPos(letter, size) {
    return -(letter.toLowerCase().charCodeAt(0) - 97) * size;
  }

  $.fn.setFlagPosition = function (iso, size) {
    size || (size = default_size);

    var x = calcPos(iso[1], size.w),
      y = calcPos(iso[0], size.h);

    return $(this).css("background-position", [x, "px ", y, "px"].join(""));
  };

  $(function () {
    $(".promo-country-flag").each(function (i, obj) {
      $(obj).find("i").setFlagPosition($(obj).data("code"));
    });

    $(".pruvit-leaderborad a").each(function (i, obj) {
      let hrefAttr = $(obj).attr("href");

      $(obj).attr("href", "#" + hrefAttr);
    });
  });
};

//js for tooltip
var tooltipJS = function () {
  $('[data-toggle="tooltip"]').tooltip();
};

// slick slider for header-slider
const headerSliderJS = () => {
  $(".offer-slider").not(".slick-initialized").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: true,
    arrows: true,
    dots: false,
    autoplay: true,
    speed: 300,
    autoplaySpeed: 4000,
    pauseOnHover: true,
  });
};

//js for marquee slide
const foodLandSlide = () => {
  $(".ultimate-marquee-slide").slick({
    speed: 7800,
    autoplay: true,
    autoplaySpeed: 0,
    centerMode: true,
    cssEase: "linear",
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    infinite: true,
    initialSlide: 1,
    arrows: false,
    buttons: false,
  });
};

function typeWrite() {
  var app = document.getElementById("typeWrite");

  var typewriter = new Typewriter(app, {
    loop: true,
  });

  typewriter
    .typeString("ketones")
    .pauseFor(2500)
    .deleteAll()
    .typeString("food")
    .pauseFor(2500)
    .deleteChars(7)
    .typeString("community")
    .pauseFor(2500)
    .start();
}
