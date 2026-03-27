document.addEventListener('DOMContentLoaded', function () {
  initFeedbackSlider();
  initStoryModal();
  initCartModal();
  initPackSelector();
  initAccordions();
  initCommunityCarousel();
  initReviewAccordion();
  initHowToSteps();
  initImpactStats();
  initReliefSteps();
  initDiscoverTabs();
  initLeaderTabs();
  initCustomerReviewsPagination();
  initUseStepsShowcase();
});

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

  const slideWidth = 570;
  const slideHeight = slides[0].getBoundingClientRect().height;

  slider.style.height = `${slideHeight}px`;

  slides.forEach((slide) => {
    slide.style.minWidth = `${slideWidth}px`;
    slide.style.width = `${slideWidth}px`;
  });

  let currentIndex = 0;
  let intervalId = null;
  let pointerStartX = null;

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

  setSlide(0);
  startAutoSlide();
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
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
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

    packClone.classList.add('is-active');
    selectedPackContainer.innerHTML = '';
    selectedPackContainer.appendChild(packClone);

    summaryName.textContent = packName;
    summaryCopy.textContent = packCopy;
    summaryPrice.textContent = formatPrice(packPrice);

    summaryTotal.textContent = formatPrice(packPrice);
  };

  const openModal = () => {
    syncSummary();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
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
    '6': document.querySelector('#your-pack-variant-6'),
  };
  let currentQty = null;
  let variantAnimationTimeout = null;
  if (packs.length === 0) return;

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
          : pack.dataset.inactiveSubtitle || '';
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
  if (accordions.length === 0) return;

  accordions.forEach((accordion, index) => {
    const trigger = accordion.querySelector('.banner__right__accordions__accordion__question');
    const answer = accordion.querySelector('.banner__right__accordions__accordion__answer');

    if (!trigger || !answer) return;

    const answerId = `banner-accordion-answer-${index + 1}`;

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
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    });
  });
}

function initCommunityCarousel() {
  const viewport = document.querySelector('[data-community-carousel]');
  const track = viewport?.querySelector('.community-carousel__track');
  if (!viewport || !track) return;

  const slides = Array.from(track.querySelectorAll('.community-carousel__slide'));
  if (slides.length === 0) return;

  const videos = Array.from(track.querySelectorAll('video'));
  videos.forEach((video) => {
    video.muted = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  });

  let offset = 0;
  let maxOffset = 0;
  let animationFrameId = null;
  let lastTimestamp = 0;
  let direction = 1;
  const speed = 110;

  const measure = () => {
    maxOffset = Math.max(track.scrollWidth - viewport.clientWidth, 0);
    offset = Math.min(offset, maxOffset);
    track.style.transform = `translate3d(-${offset}px, 0, 0)`;
  };

  const step = (timestamp) => {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    offset += speed * delta * direction;

    if (offset >= maxOffset) {
      offset = maxOffset;
      direction = -1;
    } else if (offset <= 0) {
      offset = 0;
      direction = 1;
    }

    track.style.transform = `translate3d(-${offset}px, 0, 0)`;
    animationFrameId = window.requestAnimationFrame(step);
  };

  const start = () => {
    if (animationFrameId !== null) return;
    lastTimestamp = 0;
    animationFrameId = window.requestAnimationFrame(step);
  };

  measure();
  start();
  window.addEventListener('resize', measure);
}

function initReviewAccordion() {
  const items = Array.from(document.querySelectorAll('.review-slider__item'));
  if (items.length === 0) return;

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
    const openItem = items.find((item) => item.classList.contains('is-open'));
    if (!openItem) return;

    const panel = openItem.querySelector('.review-slider__panel');
    if (!panel) return;
    panel.style.maxHeight = `${panel.scrollHeight}px`;
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
  if (tabs.length === 0 || panels.length === 0) return;

  const setActiveTab = (index) => {
    tabs.forEach((tab, tabIndex) => tab.classList.toggle('is-active', tabIndex === index));
    panels.forEach((panel, panelIndex) => panel.classList.toggle('is-active', panelIndex === index));
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setActiveTab(index));
  });

  const defaultIndex = Math.max(0, tabs.findIndex((tab) => tab.classList.contains('is-active')));
  setActiveTab(defaultIndex);
}

function initLeaderTabs() {
  const tabs = Array.from(document.querySelectorAll('[data-leader-tabs] .leaders-tabs__nav-item'));
  const panels = Array.from(document.querySelectorAll('[data-leader-panels] .leaders-tabs__panel'));
  if (tabs.length === 0 || panels.length === 0) return;

  const setActiveTab = (index) => {
    tabs.forEach((tab, tabIndex) => tab.classList.toggle('is-active', tabIndex === index));
    panels.forEach((panel, panelIndex) => panel.classList.toggle('is-active', panelIndex === index));
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setActiveTab(index));
  });

  const defaultIndex = Math.max(0, tabs.findIndex((tab) => tab.classList.contains('is-active')));
  setActiveTab(defaultIndex);
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
  let revealTimeoutId = null;

  const setActiveCard = (nextCard) => {
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

    const revealDelay = prefersReducedMotion ? 0 : 420;
    revealTimeoutId = window.setTimeout(() => {
      nextCard.classList.add('is-revealed');
    }, revealDelay);
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => setActiveCard(card));
  });

  const defaultCard = cards.find((card) => card.classList.contains('is-active')) || cards[0];
  setActiveCard(defaultCard);
}
