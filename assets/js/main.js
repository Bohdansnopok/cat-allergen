document.addEventListener('DOMContentLoaded', function () {
  const slider = document.querySelector('.banner__right__swiper');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.banner__right__swiper__feedback'));
  if (slides.length === 0) return;

  // Створюємо трек та переміщаємо слайди туди
  const track = document.createElement('div');
  track.className = 'banner__right__swiper__track';

  slides.forEach((slide) => {
    slide.style.flexShrink = '0';
    track.appendChild(slide);
  });

  // Призначаємо ширину/висоту пізніше
  slider.innerHTML = '';
  slider.appendChild(track);

  const slideWidth = 570;
  const slideHeight = slides[0].getBoundingClientRect().height;

  slider.style.height = `${slideHeight}px`;

  slides.forEach((slide) => {
    slide.style.minWidth = `${slideWidth}px`;
    slide.style.width = `${slideWidth}px`;
  });

  let currentIndex = 0;
  let intervalId = null;

  const setSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  };
  const nextSlide = () => setSlide(currentIndex + 1);
  const prevSlide = () => setSlide(currentIndex - 1);

  const startAutoSlide = () => {
    stopAutoSlide();
    intervalId = setInterval(nextSlide, 3000);
  };

  const stopAutoSlide = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  slider.addEventListener('pointerenter', stopAutoSlide);
  slider.addEventListener('pointerleave', startAutoSlide);

  let pointerStartX = null;

  slider.addEventListener('pointerdown', (event) => {
    pointerStartX = event.clientX;
    slider.setPointerCapture(event.pointerId);
  });

  slider.addEventListener('pointerup', (event) => {
    if (pointerStartX === null) return;

    const deltaX = event.clientX - pointerStartX;
    const swipeThreshold = 30;

    if (deltaX <= -swipeThreshold) {
      nextSlide();
    } else if (deltaX >= swipeThreshold) {
      prevSlide();
    }

    pointerStartX = null;
  });

  slider.addEventListener('pointercancel', () => {
    pointerStartX = null;
  });

  setSlide(0);
  startAutoSlide();
});