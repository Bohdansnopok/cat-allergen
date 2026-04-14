document.addEventListener('DOMContentLoaded', function () {
  initHeaderScrollState();
  initFeedbackSlider();
  initBannerRightScrollGate();
  initStoryModal();
  initCartModal();
  initPackSelector();
  initAccordions();
  initCommunityCarousel();
  initReviewAccordion();
  initHowToSteps();
  initImpactStats();
  initComfortBenefitsSlider();
  initReliefSteps();
  initDiscoverTabs();
  initLeaderTabs();
  initProductComparisonSlider();
  initCustomerReviewsPagination();
  initUseStepsShowcase();
  initMobileSlider();
});

function initHeaderScrollState() {
  const header = document.querySelector('.header');
  if (!header) return;

  const syncHeaderState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  syncHeaderState();
  window.addEventListener('scroll', syncHeaderState, { passive: true });
}

let lockedScrollY = 0;

function lockPageScroll() {
  lockedScrollY = window.scrollY;
  document.body.classList.add('is-page-locked');
  document.body.style.top = `-${lockedScrollY}px`;
}

function unlockPageScroll() {
  document.body.classList.remove('is-page-locked');
  document.body.style.top = '';
  window.scrollTo(0, lockedScrollY);
}

function initFeedbackSlider() {
  const slider = document.querySelector('.banner__right__swiper');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.banner__right__swiper__feedback'));
  if (slides.length === 0) return;

  const track = document.createElement('div');
  track.className = 'banner__right__swiper__track';

  slides.forEach((slide) => {
    slide.style.flexShrink = '0';
    track.appendChild(slide);
  });

  slider.innerHTML = '';
  slider.appendChild(track);

  let currentIndex = 0;
  let intervalId = null;
  let pointerStartX = null;
  let slideWidth = 0;

  const syncDimensions = () => {
    slideWidth = Math.round(slider.getBoundingClientRect().width);
    if (!slideWidth) return;

    slides.forEach((slide) => {
      slide.style.minWidth = `${slideWidth}px`;
      slide.style.width = `${slideWidth}px`;
    });

    const slideHeight = slides[0].getBoundingClientRect().height;
    slider.style.height = `${slideHeight}px`;
    setSlide(currentIndex);
  };

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

  syncDimensions();
  startAutoSlide();
  window.addEventListener('resize', syncDimensions);
}

function initBannerRightScrollGate() {
  const banner = document.querySelector('.banner');
  const leftColumn = banner?.querySelector('.banner__left');
  const rightColumn = document.querySelector('.banner__right__scroll');
  const compactViewport = window.matchMedia('(max-width: 800px)');

  if (!banner || !leftColumn || !rightColumn || compactViewport.matches) return;
  let isGateEngaged = false;
  let lockedPageScrollY = 0;

  const canScrollRightColumn = (deltaY) => {
    const maxScrollTop = rightColumn.scrollHeight - rightColumn.clientHeight;
    if (maxScrollTop <= 0) return false;

    if (deltaY > 0) {
      return rightColumn.scrollTop < maxScrollTop - 1;
    }

    if (deltaY < 0) {
      return rightColumn.scrollTop > 1;
    }

    return false;
  };

  const isBannerInView = () => {
    const rect = banner.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  };

  const hasReachedLeftColumnBottom = () => {
    const leftRect = leftColumn.getBoundingClientRect();
    const leftBottom = window.scrollY + leftRect.bottom;
    const viewportBottom = window.scrollY + window.innerHeight;

    return viewportBottom >= leftBottom;
  };

  const syncGate = () => {
    if (compactViewport.matches) {
      isGateEngaged = false;
      rightColumn.classList.remove('is-scroll-locked');
      return;
    }

    if (!isBannerInView()) {
      isGateEngaged = false;
    }

    if (isGateEngaged && Math.abs(window.scrollY - lockedPageScrollY) > 1) {
      window.scrollTo(0, lockedPageScrollY);
    }

    rightColumn.classList.toggle('is-scroll-locked', !isGateEngaged);
  };

  syncGate();
  window.addEventListener('scroll', syncGate, { passive: true });
  window.addEventListener('resize', syncGate);

  window.addEventListener('wheel', (event) => {
    if (compactViewport.matches) {
      isGateEngaged = false;
      rightColumn.classList.remove('is-scroll-locked');
      return;
    }

    if (!isBannerInView()) {
      isGateEngaged = false;
      syncGate();
      return;
    }

    const nextDirection = Math.sign(event.deltaY);
    if (nextDirection === 0) return;

    const canScrollNow = canScrollRightColumn(event.deltaY);
    const shouldEngageNow =
      canScrollNow &&
      (
        (event.deltaY > 0 && hasReachedLeftColumnBottom()) ||
        (event.deltaY < 0 && rightColumn.scrollTop > 1)
      );

    if (!isGateEngaged && !shouldEngageNow) {
      syncGate();
      return;
    }

    if (!canScrollNow) {
      isGateEngaged = false;
      syncGate();
      return;
    }

    isGateEngaged = true;
    lockedPageScrollY = window.scrollY;
    rightColumn.scrollTop += event.deltaY;
    syncGate();
    event.preventDefault();
  }, { passive: false });
}

function initStoryModal() {
  const trigger = document.querySelector('.preview-trigger');
  const modal = document.querySelector('.story-modal');
  const overlay = modal?.querySelector('.story-modal__overlay');
  const dialog = modal?.querySelector('.story-modal__dialog');
  const video = modal?.querySelector('.story-modal__video');

  if (!trigger || !modal || !overlay || !dialog || !video) return;

  const openModal = () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lockPageScroll();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    unlockPageScroll();
    video.pause();
  };

  trigger.addEventListener('click', openModal);

  overlay.addEventListener('click', (event) => {
    if (!dialog.contains(event.target)) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

function initCartModal() {
  const trigger = document.querySelector('[data-cart-modal-trigger]');
  const modal = document.querySelector('.cart-modal');
  const overlay = modal?.querySelector('.cart-modal__overlay');
  const dialog = modal?.querySelector('.cart-modal__dialog');
  const closeButton = modal?.querySelector('[data-cart-modal-close-button]');
  const packs = Array.from(document.querySelectorAll('[data-pack-option]'));
  const selectedPackContainer = modal?.querySelector('[data-cart-selected-pack]');
  const summaryName = modal?.querySelector('[data-cart-summary-name]');
  const summaryCopy = modal?.querySelector('[data-cart-summary-copy]');
  const summaryPrice = modal?.querySelector('[data-cart-summary-price]');
  const summaryDiscount = modal?.querySelector('[data-cart-summary-discount]');
  const summaryOldPrice = modal?.querySelector('[data-cart-summary-old-price]');
  const summaryTotal = modal?.querySelector('[data-cart-summary-total]');

  if (!trigger || !modal || !overlay || !dialog || !selectedPackContainer || !summaryName || !summaryCopy || !summaryPrice || !summaryTotal) return;

  const formatPrice = (value) => `${new Intl.NumberFormat('uk-UA').format(value)} грн`;

  const getActivePack = () => packs.find((pack) => pack.classList.contains('is-active')) || packs[0] || null;

  const syncSummary = () => {
    const activePack = getActivePack();
    if (!activePack) return;

    const packClone = activePack.cloneNode(true);
    const packName = activePack.querySelector('h4')?.textContent?.trim() || 'Обраний пакет';
    const packCopy = activePack.querySelector('.banner__right__choose-product__pack__top-line__pack-subtitle')?.textContent?.trim() || '';
    const packPrice = Number((activePack.dataset.buttonPrice || '0').replace(/[^\d]/g, ''));
    const packDiscountAmount = activePack.dataset.discountAmount || '';
    const packDiscountValue = Number(packDiscountAmount.replace(/[^\d]/g, ''));
    const packOldPrice = packPrice + packDiscountValue;

    packClone.classList.add('is-active');
    selectedPackContainer.innerHTML = '';
    selectedPackContainer.appendChild(packClone);

    summaryName.textContent = packName;
    summaryCopy.textContent = packCopy;
    summaryPrice.textContent = formatPrice(packPrice);
    if (summaryDiscount && summaryOldPrice && packDiscountValue) {
      summaryDiscount.hidden = false;
      summaryOldPrice.textContent = formatPrice(packOldPrice);
    } else if (summaryDiscount) {
      summaryDiscount.hidden = true;
    }

    summaryTotal.textContent = formatPrice(packPrice);
  };

  const openModal = () => {
    syncSummary();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lockPageScroll();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    unlockPageScroll();
  };

  trigger.addEventListener('click', openModal);
  closeButton?.addEventListener('click', closeModal);

  overlay.addEventListener('click', (event) => {
    if (!dialog.contains(event.target)) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  syncSummary();
}

function initPackSelector() {
  const packs = Array.from(document.querySelectorAll('[data-pack-option]'));
  const submitPrice = document.querySelector('.banner__right__choose-product__submit__price');
  const yourPackTitle = document.querySelector('#your-pack-title');
  const yourPackCopy = document.querySelector('#your-pack-copy');
  const yourPackVariants = {
    '1': document.querySelector('#your-pack-variant-1'),
    '2': document.querySelector('#your-pack-variant-2'),
  };
  let currentQty = null;
  let variantAnimationTimeout = null;
  if (packs.length === 0) return;

  const getInactiveSubtitle = (pack) => {
    const savings = pack.dataset.inactiveSavings;
    if (savings) {
      return `Заощадьте ${savings} грн`;
    }

    return pack.dataset.inactiveSubtitle || '';
  };

  Object.values(yourPackVariants).forEach((variant) => {
    if (!variant) return;

    Array.from(variant.querySelectorAll('image')).forEach((image, index) => {
      image.style.setProperty('--stack-order', index);
    });
  });

  const clearVariantAnimationClasses = () => {
    Object.values(yourPackVariants).forEach((variant) => {
      if (!variant) return;
      variant.classList.remove('is-stacking-in', 'is-pulling-out');
    });
  };

  const animateVariantIn = (variant) => {
    if (!variant) return;
    variant.classList.remove('is-hidden', 'is-pulling-out', 'is-stacking-in');
    void variant.getBoundingClientRect();
    variant.classList.add('is-stacking-in');
  };

  const setActivePack = (nextActivePack) => {
    packs.forEach((pack) => {
      const isActive = pack === nextActivePack;
      const subtitle = pack.querySelector('.banner__right__choose-product__pack__top-line__pack-subtitle');
      const circle = pack.querySelector('.banner__right__choose-product__pack__top-line__circle');

      pack.classList.toggle('is-active', isActive);

      if (circle) {
        circle.classList.toggle('active', isActive);
      }

      if (subtitle) {
        subtitle.textContent = isActive
          ? pack.dataset.activeSubtitle || ''
          : getInactiveSubtitle(pack);
      }

      if (isActive && submitPrice) {
        submitPrice.textContent = pack.dataset.buttonPrice || '';
      }

      if (isActive && yourPackTitle) {
        yourPackTitle.textContent = pack.dataset.yourPackTitle || '';
      }

      if (isActive && yourPackCopy) {
        yourPackCopy.textContent = pack.dataset.yourPackCopy || '';
      }

      if (isActive) {
        const qty = pack.dataset.yourPackQty || '1';
        const nextQty = Number(qty);
        const nextVariant = yourPackVariants[qty];
        const currentVariant = currentQty ? yourPackVariants[String(currentQty)] : null;

        if (variantAnimationTimeout) {
          clearTimeout(variantAnimationTimeout);
          variantAnimationTimeout = null;
        }

        clearVariantAnimationClasses();

        if (!currentVariant || currentQty === null || nextQty === currentQty) {
          Object.entries(yourPackVariants).forEach(([variantQty, variantNode]) => {
            if (!variantNode) return;
            variantNode.classList.toggle('is-hidden', variantQty !== qty);
          });
        } else if (nextQty > currentQty) {
          Object.entries(yourPackVariants).forEach(([variantQty, variantNode]) => {
            if (!variantNode) return;
            variantNode.classList.toggle('is-hidden', variantQty !== qty);
          });
          animateVariantIn(nextVariant);
          variantAnimationTimeout = setTimeout(() => {
            nextVariant?.classList.remove('is-stacking-in');
          }, 900);
        } else {
          if (currentVariant) {
            currentVariant.classList.remove('is-hidden');
            currentVariant.classList.add('is-pulling-out');
          }

          variantAnimationTimeout = setTimeout(() => {
            Object.entries(yourPackVariants).forEach(([variantQty, variantNode]) => {
              if (!variantNode) return;
              variantNode.classList.toggle('is-hidden', variantQty !== qty);
            });

            animateVariantIn(nextVariant);

            variantAnimationTimeout = setTimeout(() => {
              nextVariant?.classList.remove('is-stacking-in');
            }, 900);
          }, 260);
        }

        currentQty = nextQty;
      }
    });
  };

  packs.forEach((pack) => {
    const trigger = pack.querySelector('[data-pack-trigger]');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      setActivePack(pack);
    });
  });

  const defaultPack = packs.find((pack) => pack.classList.contains('is-active')) || packs[0];
  setActivePack(defaultPack);
}

function initAccordions() {
  const accordions = Array.from(document.querySelectorAll('.banner__right__accordions__accordion'));
  const rightColumn = document.querySelector('.banner__right__scroll');
  if (accordions.length === 0) return;

  const revealAccordionContent = (accordion, answer) => {
    if (!rightColumn) return;
    const trigger = accordion.querySelector('.banner__right__accordions__accordion__question');
    if (!trigger) return;

    const centerAccordionInView = () => {
      rightColumn.classList.remove('is-scroll-locked');

      const columnRect = rightColumn.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const triggerCenter = triggerRect.top + triggerRect.height / 2;
      const columnCenter = columnRect.top + columnRect.height / 2;
      const nextScrollTop = rightColumn.scrollTop + (triggerCenter - columnCenter);
      const maxScrollTop = Math.max(0, rightColumn.scrollHeight - rightColumn.clientHeight);
      const targetScrollTop = Math.min(maxScrollTop, Math.max(0, nextScrollTop));

      rightColumn.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    };

    centerAccordionInView();
    requestAnimationFrame(centerAccordionInView);
    setTimeout(centerAccordionInView, 180);
    setTimeout(centerAccordionInView, 320);

    const handleTransitionEnd = (event) => {
      if (event.propertyName !== 'max-height') return;
      centerAccordionInView();
      answer.removeEventListener('transitionend', handleTransitionEnd);
    };

    answer.addEventListener('transitionend', handleTransitionEnd);
  };

  accordions.forEach((accordion, index) => {
    const trigger = accordion.querySelector('.banner__right__accordions__accordion__question');
    const answer = accordion.querySelector('.banner__right__accordions__accordion__answer');

    if (!trigger || !answer) return;

    const answerId = `banner-accordion-answer-${index + 1}`;
    const triggerId = `banner-accordion-trigger-${index + 1}`;

    trigger.id = triggerId;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', answerId);
    answer.id = answerId;
    answer.hidden = true;

    trigger.addEventListener('click', () => {
      const isOpen = accordion.classList.contains('is-open');

      accordions.forEach((item) => {
        const itemTrigger = item.querySelector('.banner__right__accordions__accordion__question');
        const itemAnswer = item.querySelector('.banner__right__accordions__accordion__answer');

        if (!itemTrigger || !itemAnswer) return;

        item.classList.remove('is-open');
        itemTrigger.setAttribute('aria-expanded', 'false');
        itemAnswer.style.maxHeight = '0px';
        itemAnswer.hidden = true;
      });

      if (isOpen) return;

      accordion.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      answer.hidden = false;
      // Р вЂ”Р Р…РЎвЂ“Р СР В°РЎвЂќР СР С• hidden, Р С—Р С•РЎвЂљРЎвЂ“Р С Р В±Р ВµРЎР‚Р ВµР СР С• scrollHeight РІР‚вЂќ РЎвЂљР ВµР С—Р ВµРЎР‚ Р В±РЎС“Р Т‘Р Вµ РЎвЂљР С•РЎвЂЎР Р…Р С‘Р в„– РЎР‚Р С•Р В·Р СРЎвЂ“РЎР‚
      requestAnimationFrame(() => {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
        requestAnimationFrame(() => revealAccordionContent(accordion, answer));
      });
    });
  });
}

function initCommunityCarousel() {
  const viewport = document.querySelector('[data-community-carousel]');
  const track = viewport?.querySelector('.community-carousel__track');
  if (!viewport || !track) return;
  const compactViewport = window.matchMedia('(max-width: 800px)');
  const originalSlides = Array.from(track.querySelectorAll('.community-carousel__slide'));
  if (originalSlides.length === 0) return;

  if (!track.dataset.loopReady) {
    originalSlides.forEach((slide) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.dataset.clone = 'true';
      track.appendChild(clone);
    });
    track.dataset.loopReady = 'true';
  }

  let offset = 0;
  let loopWidth = 0;
  let animationFrameId = null;
  let lastTimestamp = 0;

  const getSpeed = () => (compactViewport.matches ? 56 : 82);

  const syncTrackPosition = () => {
    track.style.transform = `translate3d(-${offset}px, 0, 0)`;
  };

  const measure = () => {
    const slides = Array.from(track.querySelectorAll('.community-carousel__slide'));
    const baseSlides = slides.slice(0, slides.length / 2);
    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.gap || trackStyles.columnGap || '0');

    loopWidth = baseSlides.reduce((total, slide, index) => {
      return total + slide.getBoundingClientRect().width + (index > 0 ? gap : 0);
    }, 0);

    if (loopWidth > 0) {
      offset %= loopWidth;
    } else {
      offset = 0;
    }

    syncTrackPosition();
  };

  const stop = () => {
    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  const step = (timestamp) => {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (loopWidth > 0) {
      offset += getSpeed() * delta;
      if (offset >= loopWidth) {
        offset -= loopWidth;
      }
      syncTrackPosition();
    }

    animationFrameId = window.requestAnimationFrame(step);
  };

  const start = () => {
    stop();
    lastTimestamp = 0;
    measure();
    animationFrameId = window.requestAnimationFrame(step);
  };

  const videos = Array.from(track.querySelectorAll('.community-carousel__video'));
  const ensurePlayback = () => {
    videos.forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.loop = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('autoplay', '');
      video.setAttribute('loop', '');

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    });
  };

  videos.forEach((video) => {
    video.addEventListener('loadedmetadata', start, { passive: true });
    video.addEventListener('loadeddata', start, { passive: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
      return;
    }

    ensurePlayback();
    start();
  });

  compactViewport.addEventListener('change', () => {
    ensurePlayback();
    start();
  });

  ensurePlayback();
  start();
  window.addEventListener('resize', start);
  window.addEventListener('load', start);
}

function initReviewAccordion() {
  const items = Array.from(document.querySelectorAll('.review-slider__item'));
  if (items.length === 0) return;
  const mobileViewport = window.matchMedia('(max-width: 640px)');

  const syncOpenPanelHeight = () => {
    const openItem = items.find((item) => item.classList.contains('is-open'));
    if (!openItem) return;

    const panel = openItem.querySelector('.review-slider__panel');
    if (!panel) return;
    panel.style.maxHeight = `${panel.scrollHeight}px`;
  };

  const initMobileCardSlider = (item) => {
    const panel = item.querySelector('.review-slider__panel');
    const cards = item.querySelector('.review-slider__cards');
    if (!panel || !cards || cards.dataset.mobileSliderInit === 'true') return;

    cards.dataset.mobileSliderInit = 'true';

    const slides = Array.from(cards.querySelectorAll('.review-slider__card'));
    if (slides.length <= 1) return;

    const dots = document.createElement('div');
    dots.className = 'review-slider__mobile-dots';
    dots.setAttribute('aria-label', 'Перемикання відгуків');

    const updateDots = () => {
      const slideWidth = cards.clientWidth || 1;
      const activeIndex = Math.min(
        slides.length - 1,
        Math.max(0, Math.round(cards.scrollLeft / slideWidth))
      );

      dots.querySelectorAll('.review-slider__mobile-dot').forEach((dot, index) => {
        dot.classList.toggle('is-active', index === activeIndex);
        dot.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
      });
    };

    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `review-slider__mobile-dot${index === 0 ? ' is-active' : ''}`;
      dot.setAttribute('aria-label', `Показати відгук ${index + 1}`);
      dot.setAttribute('aria-current', index === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => {
        cards.scrollTo({
          left: cards.clientWidth * index,
          behavior: 'smooth',
        });
      });
      dots.appendChild(dot);
    });

    cards.addEventListener('scroll', updateDots, { passive: true });
    panel.appendChild(dots);
    updateDots();
  };

  const setOpenItem = (nextItem) => {
    items.forEach((item) => {
      const trigger = item.querySelector('.review-slider__trigger');
      const panel = item.querySelector('.review-slider__panel');
      const isOpen = item === nextItem;

      item.classList.toggle('is-open', isOpen);

      if (trigger) {
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }

      if (panel) {
        panel.style.maxHeight = isOpen ? `${panel.scrollHeight}px` : '0px';
      }
    });
  };

  items.forEach((item, index) => {
    const trigger = item.querySelector('.review-slider__trigger');
    const panel = item.querySelector('.review-slider__panel');
    if (!trigger || !panel) return;

    if (mobileViewport.matches) {
      initMobileCardSlider(item);
    }

    trigger.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');
    panel.style.maxHeight = item.classList.contains('is-open') ? `${panel.scrollHeight}px` : '0px';

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      setOpenItem(isOpen ? null : item);
    });

    if (index === 0 && item.classList.contains('is-open')) {
      panel.style.maxHeight = `${panel.scrollHeight}px`;
    }
  });

  const defaultItem = items.find((item) => item.classList.contains('is-open')) || items[0];
  setOpenItem(defaultItem);

  window.addEventListener('resize', () => {
    if (mobileViewport.matches) {
      items.forEach((item) => initMobileCardSlider(item));
    }

    syncOpenPanelHeight();
  });
}

function initHowToSteps() {
  const tabs = Array.from(document.querySelectorAll('[data-howto-tabs] .how-to-steps__thumb'));
  const stageImage = document.querySelector('[data-step-stage-image]');
  const stageMeta = document.querySelector('[data-step-stage-meta]');
  if (tabs.length === 0 || !stageImage || !stageMeta) return;

  const titleNode = stageMeta.querySelector('h3');
  const subtitleNode = stageMeta.querySelector('h4');
  const copyNode = stageMeta.querySelector('p');
  if (!titleNode || !subtitleNode || !copyNode) return;

  const setActiveTab = (nextTab) => {
    tabs.forEach((tab) => tab.classList.toggle('is-active', tab === nextTab));
    stageImage.src = nextTab.dataset.stepImage || stageImage.src;
    titleNode.textContent = nextTab.dataset.stepTitle || '';
    subtitleNode.textContent = nextTab.dataset.stepSubtitle || '';
    copyNode.textContent = nextTab.dataset.stepCopy || '';
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setActiveTab(tab));
  });

  const defaultTab = tabs.find((tab) => tab.classList.contains('is-active')) || tabs[0];
  setActiveTab(defaultTab);
}

function initImpactStats() {
  const section = document.querySelector('[data-impact-stats]');
  if (!section) return;

  const circles = Array.from(section.querySelectorAll('[data-stat-circle]'));
  const counters = Array.from(section.querySelectorAll('[data-count-to]'));
  let hasAnimated = false;

  const animateCounter = (node) => {
    const target = Number(node.dataset.countTo || '0');
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = String(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || hasAnimated) return;
      hasAnimated = true;
      circles.forEach((circle) => circle.classList.add('is-visible'));
      counters.forEach(animateCounter);
      observer.disconnect();
    });
  }, { threshold: 0.35 });

  observer.observe(section);
}

function initComfortBenefitsSlider() {
  const track = document.querySelector('[data-comfort-slider]');
  const dotsWrap = document.querySelector('[data-comfort-dots]');
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.querySelectorAll('[data-comfort-slide]'));
  const dots = Array.from(dotsWrap.querySelectorAll('.comfort-benefits__dot'));
  if (slides.length === 0 || dots.length === 0) return;

  const setActiveDot = (index) => {
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  };

  const getNearestIndex = () => {
    const trackLeft = track.getBoundingClientRect().left;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - trackLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  };

  track.addEventListener('scroll', () => {
    setActiveDot(getNearestIndex());
  }, { passive: true });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      slides[index]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest',
      });
      setActiveDot(index);
    });
  });

  setActiveDot(0);
}

function initReliefSteps() {
  const steps = Array.from(document.querySelectorAll('[data-relief-steps] .relief-timeline__step'));
  if (steps.length === 0) return;

  const setActiveStep = (nextStep) => {
    steps.forEach((step) => step.classList.toggle('is-active', step === nextStep));
  };

  steps.forEach((step) => {
    step.addEventListener('click', () => setActiveStep(step));
  });

  const defaultStep = steps.find((step) => step.classList.contains('is-active')) || steps[0];
  setActiveStep(defaultStep);
}

function initDiscoverTabs() {
  const tabs = Array.from(document.querySelectorAll('[data-discover-tabs] .discover-whisker__tab'));
  const panels = Array.from(document.querySelectorAll('[data-discover-panels] .discover-whisker__text'));
  const images = Array.from(document.querySelectorAll('[data-discover-panels] .discover-whisker__image'));
  const contentContainer = document.querySelector('[data-discover-panels]');

  if (tabs.length === 0 || panels.length === 0 || !contentContainer) return;

  const moveContentUnderTab = (tab) => {
    if (window.innerWidth <= 800) {
      tab.insertAdjacentElement('afterend', contentContainer);
    } else {
      const card = tab.closest('.discover-whisker__card');
      if (card && !card.contains(contentContainer)) {
        card.appendChild(contentContainer);
      }
    }
  };

  const syncPanelHeights = () => {
    panels.forEach((panel) => {
      panel.style.setProperty('--discover-panel-height', `${panel.scrollHeight}px`);
    });
  };

  const schedulePanelHeightSync = () => {
    requestAnimationFrame(syncPanelHeights);
    setTimeout(syncPanelHeights, 120);
    setTimeout(syncPanelHeights, 280);
    setTimeout(syncPanelHeights, 480);
  };

  const setActiveTab = (index, animate = true) => {
    const selectedTab = tabs[index];
    if (!selectedTab) return;

    moveContentUnderTab(selectedTab);

    tabs.forEach((tab, tabIndex) => tab.classList.toggle('is-active', tabIndex === index));
    panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === index;
      panel.classList.toggle('is-active', isActive);
      panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');

      if (!animate) {
        panel.style.transition = 'none';
        requestAnimationFrame(() => {
          panel.style.transition = '';
        });
      }
    });
    images.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === index));

    schedulePanelHeightSync();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setActiveTab(index));
  });

  panels.forEach((panel) => {
    panel.querySelectorAll('img').forEach((image) => {
      if (image.complete) return;
      image.addEventListener('load', schedulePanelHeightSync, { passive: true });
      image.addEventListener('error', schedulePanelHeightSync, { passive: true });
    });

    panel.querySelectorAll('video').forEach((video) => {
      video.addEventListener('loadeddata', schedulePanelHeightSync, { passive: true });
      video.addEventListener('loadedmetadata', schedulePanelHeightSync, { passive: true });
    });
  });

  const defaultIndex = Math.max(0, tabs.findIndex((tab) => tab.classList.contains('is-active')));
  setActiveTab(defaultIndex, false);

  window.addEventListener('resize', () => {
    syncPanelHeights();
    setActiveTab(tabs.findIndex((tab) => tab.classList.contains('is-active')), false);
  });
}

function initLeaderTabs() {
  const tabs = Array.from(document.querySelectorAll('[data-leader-tabs] .leaders-tabs__nav-item'));
  const panels = Array.from(document.querySelectorAll('[data-leader-panels] .leaders-tabs__panel'));
  if (tabs.length === 0 || panels.length === 0) return;

  const fadeOutMs = 180;
  const fadeInMs = 300;
  let activeIndex = -1;
  let switchTimeout = null;

  const showPanel = (panel, animate) => {
    panel.classList.add('is-active');

    if (!animate) {
      panel.style.opacity = '';
      panel.style.transition = '';
      return;
    }

    panel.style.opacity = '0';
    panel.style.transition = `opacity ${fadeInMs}ms ease`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.style.opacity = '1';
      });
    });
  };

  const cleanupPanelStyles = (panel) => {
    panel.style.opacity = '';
    panel.style.transition = '';
  };

  const setActiveTab = (index, animate = true) => {
    if (index === activeIndex || !panels[index] || !tabs[index]) return;

    tabs.forEach((tab, tabIndex) => tab.classList.toggle('is-active', tabIndex === index));

    const nextPanel = panels[index];
    const currentPanel = activeIndex >= 0 ? panels[activeIndex] : null;

    if (switchTimeout) {
      window.clearTimeout(switchTimeout);
      switchTimeout = null;
    }

    if (!animate || !currentPanel) {
      panels.forEach((panel, panelIndex) => {
        panel.classList.toggle('is-active', panelIndex === index);
        cleanupPanelStyles(panel);
      });
      showPanel(nextPanel, false);
      activeIndex = index;
      return;
    }

    currentPanel.style.transition = `opacity ${fadeOutMs}ms ease`;
    currentPanel.style.opacity = '0';

    switchTimeout = window.setTimeout(() => {
      currentPanel.classList.remove('is-active');
      cleanupPanelStyles(currentPanel);

      panels.forEach((panel, panelIndex) => {
        if (panelIndex !== index) {
          panel.classList.remove('is-active');
          cleanupPanelStyles(panel);
        }
      });

      showPanel(nextPanel, true);
      activeIndex = index;

      switchTimeout = window.setTimeout(() => {
        cleanupPanelStyles(nextPanel);
        switchTimeout = null;
      }, fadeInMs);
    }, fadeOutMs);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setActiveTab(index));
  });

  const defaultIndex = Math.max(0, tabs.findIndex((tab) => tab.classList.contains('is-active')));
  setActiveTab(defaultIndex, false);
}

function initCustomerReviewsPagination() {
  const section = document.querySelector('[data-reviews-pagination]');
  if (!section) return;

  const pages = Array.from(section.querySelectorAll('[data-reviews-page]'));
  const buttons = Array.from(section.querySelectorAll('[data-reviews-page-button]'));
  if (pages.length === 0 || buttons.length === 0) return;

  const setActivePage = (pageId) => {
    pages.forEach((page) => {
      const isActive = page.dataset.reviewsPage === pageId;
      page.classList.toggle('is-active', isActive);
      page.hidden = !isActive;
    });

    buttons.forEach((button) => {
      const isActive = button.dataset.reviewsPageButton === pageId;
      button.classList.toggle('is-active', isActive);

      if (isActive) {
        button.setAttribute('aria-current', 'page');
      } else {
        button.removeAttribute('aria-current');
      }
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      setActivePage(button.dataset.reviewsPageButton || '1');
    });
  });

  const defaultPage = pages.find((page) => page.classList.contains('is-active'))?.dataset.reviewsPage || '1';
  setActivePage(defaultPage);
}

function initUseStepsShowcase() {
  const section = document.querySelector('[data-use-steps]');
  if (!section) return;

  const cards = Array.from(section.querySelectorAll('[data-step-card]'));
  if (cards.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileViewport = window.matchMedia('(max-width: 800px)');
  let revealTimeoutId = null;

  const setActiveCard = (nextCard) => {
    if (mobileViewport.matches) return;

    if (revealTimeoutId !== null) {
      window.clearTimeout(revealTimeoutId);
      revealTimeoutId = null;
    }

    cards.forEach((card) => {
      const isActive = card === nextCard;
      card.classList.toggle('is-active', isActive);
      card.classList.remove('is-revealed');
      card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    const revealDelay = prefersReducedMotion ? 0 : 620;
    revealTimeoutId = window.setTimeout(() => {
      nextCard.classList.add('is-revealed');
    }, revealDelay);
  };

  const render = () => {
    if (mobileViewport.matches) {
      if (revealTimeoutId !== null) {
        window.clearTimeout(revealTimeoutId);
        revealTimeoutId = null;
      }

      cards.forEach((card) => {
        card.classList.add('is-active', 'is-revealed');
        card.setAttribute('aria-pressed', 'false');
      });
      return;
    }

    const defaultCard = cards.find((card) => card.classList.contains('is-active')) || cards[0];
    setActiveCard(defaultCard);
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => setActiveCard(card));
  });

  mobileViewport.addEventListener('change', render);
  render();
}

function initProductComparisonSlider() {
  const slider = document.querySelector('[data-product-comparison-mobile]');
  if (!slider) return;

  const mobileViewport = window.matchMedia('(max-width: 800px)');
  const viewport = slider.querySelector('.product-comparison-mobile__viewport');
  const slides = Array.from(slider.querySelectorAll('[data-product-comparison-slide]'));
  const prevBtn = slider.querySelector('[data-product-comparison-mobile-prev]');
  const nextBtn = slider.querySelector('[data-product-comparison-mobile-next]');
  let currentIndex = 0;
  let direction = 'next';

  const render = () => {
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', !mobileViewport.matches || index === currentIndex);
    });
    slider.dataset.direction = direction;

    if (mobileViewport.matches && viewport) {
      const activeSlide = slides[currentIndex];
      viewport.style.height = `${activeSlide.offsetHeight}px`;
    } else if (viewport) {
      viewport.style.height = '';
    }
  };

  prevBtn?.addEventListener('click', () => {
    direction = 'prev';
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    render();
  });

  nextBtn?.addEventListener('click', () => {
    direction = 'next';
    currentIndex = (currentIndex + 1) % slides.length;
    render();
  });

  mobileViewport.addEventListener('change', render);
  window.addEventListener('resize', render);
  render();
}

function initMobileSlider() {
  const slider = document.getElementById('mobile-slider');
  if (!slider) return;

  const mainImg = document.getElementById('slider-main-img');
  const thumbnails = slider.querySelectorAll('.thumbnail');
  const dots = slider.querySelectorAll('.dot');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');

  let currentIndex = 0;

  function updateSlider(index) {
    currentIndex = index;
    const selectedThumb = thumbnails[currentIndex];
    mainImg.src = selectedThumb.dataset.src;
    mainImg.dataset.variant = selectedThumb.dataset.variant || 'default';
    const fitMode = selectedThumb.dataset.fit || 'cover';
    const objectPosition = selectedThumb.dataset.position || 'center center';
    const scale = selectedThumb.dataset.scale || '1';
    mainImg.classList.toggle('is-contain', fitMode === 'contain');
    mainImg.classList.toggle('is-cover', fitMode !== 'contain');
    mainImg.style.objectFit = fitMode;
    mainImg.style.objectPosition = objectPosition;
    mainImg.style.setProperty('--slider-main-scale', scale);
    mainImg.style.transform = `scale(${scale})`;
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === currentIndex);
    });
    selectedThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    dots.forEach((dot) => {
      dot.classList.toggle('active', parseInt(dot.dataset.index) === currentIndex);
    });
  }

  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => updateSlider(index));
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index);
      updateSlider(index);
    });
  });

  prevBtn.addEventListener('click', () => {
    const newIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
    updateSlider(newIndex);
  });

  nextBtn.addEventListener('click', () => {
    const newIndex = (currentIndex + 1) % thumbnails.length;
    updateSlider(newIndex);
  });

  // Initial setup
  updateSlider(0);
}



