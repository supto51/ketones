const researchSliderJS = () => {
  $(".research-slider").slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: false,
    autoplay: false,
    dots: false,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1023,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  });
};

const aosJS = () => {
  AOS.init({
    duration: 1500,
    once: true,
  });
};

const researchFlipCardJS = () => {
  const learnMoreEl = document.getElementsByClassName("learn-more");
  const cardCloseEl = document.getElementsByClassName("card-close");

  const cardRotated = function (e) {
    e.preventDefault();
    const researchLab = this.closest(".research-card");
    const cardFront = researchLab.querySelector(".card-front");
    const cardBack = researchLab.querySelector(".card-back");
    cardBack.classList.add("active");
    cardFront.style.transform = "rotateY(180deg)";
  };

  const cardCLose = function (e) {
    e.preventDefault();
    const researchLab = this.closest(".research-card");
    const cardFront = researchLab.querySelector(".card-front");
    const cardBack = researchLab.querySelector(".card-back");
    cardBack.classList.remove("active");
    cardFront.style.transform = "rotateY(0deg)";
  };

  Array.from(learnMoreEl).forEach(function (el) {
    el.addEventListener("click", cardRotated);
  });

  Array.from(cardCloseEl).forEach(function (el) {
    el.addEventListener("click", cardCLose);
  });
};


const smartshipFlipCardJS = () => {
  const learnMoreEl = document.getElementsByClassName("learn-more");
  const cardCloseEl = document.getElementsByClassName("card-close");

  const cardRotated = function (e) {
    e.preventDefault();
    const exclusiveCard = this.closest(".exclusive-card");
    const cardFront = exclusiveCard.querySelector(".card-front");
    const cardBack = exclusiveCard.querySelector(".card-back");
    cardBack.classList.add("active");
    cardFront.style.transform = "rotateY(180deg)";
  };

  const cardCLose = function (e) {
    e.preventDefault();
    const exclusiveCard = this.closest(".exclusive-card");
    const cardFront = exclusiveCard.querySelector(".card-front");
    const cardBack = exclusiveCard.querySelector(".card-back");
    cardBack.classList.remove("active");
    cardFront.style.transform = "rotateY(0deg)";
  };

  Array.from(learnMoreEl).forEach(function (el) {
    el.addEventListener("click", cardRotated);
  });

  Array.from(cardCloseEl).forEach(function (el) {
    el.addEventListener("click", cardCLose);
  });
};
