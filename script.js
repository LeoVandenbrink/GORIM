(function () {
  "use strict";

  /* ============ ДАННЫЕ МЕНЮ ============ */
  var MENU = [
    { id: "b1", cat: "burgers", name: "Дымный Чед", price: 420, desc: "Говядина, двойной чеддер, бекон, дымный BBQ-соус.", photo: "https://images.unsplash.com/photo-1534790566855-4cb788d389ec" },
    { id: "b2", cat: "burgers", name: "Огненный Джек", price: 450, desc: "Халапеньо, джек-сыр, острый соус, маринованный лук.", photo: "https://images.unsplash.com/photo-1572448862527-d3c904757de6" },
    { id: "b3", cat: "burgers", name: "Классика Дровосека", price: 380, desc: "Говядина, соленый лук, горчица, кетчуп — и больше ничего лишнего.", photo: "https://images.unsplash.com/photo-1591336277697-cdae7e42dead" },
    { id: "b4", cat: "burgers", name: "Гриль Цыплёнок", price: 400, desc: "Куриное бедро с углей, гуакамоле, руккола, чесночный майо.", photo: "https://images.unsplash.com/photo-1481070555726-e2fe8357725c" },
    { id: "b5", cat: "burgers", name: "Вегги Уголёк", price: 390, desc: "Растительная котлета, печёный перец, соус на кешью.", photo: "https://images.unsplash.com/photo-1564849012987-56a988d14596" },
    { id: "b6", cat: "burgers", name: "Двойной Дурман", price: 490, desc: "Двойная говядина, тройной сыр — для тех, кто пришёл всерьёз.", photo: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9" },
    { id: "s1", cat: "sides", name: "Картофель фри с паприкой", price: 180, desc: "Хрустящая соломка, копчёная паприка, соус на выбор.", photo: "https://images.unsplash.com/photo-1688978181542-87a886a16fbe" },
    { id: "s2", cat: "sides", name: "Луковые кольца", price: 190, desc: "В темном пиве кляре, обжарены до хруста." },
    { id: "s3", cat: "sides", name: "Коул-слоу", price: 140, desc: "Капуста, морковь, лёгкая заправка — освежает после огня." },
    { id: "d1", cat: "drinks", name: "Крафтовый лимонад", price: 190, desc: "Имбирь, лайм, мята — гасит остроту не хуже воды." },
    { id: "d2", cat: "drinks", name: "Молочный шейк", price: 240, desc: "Ваниль или карамель, густой, с ложкой вместо трубочки." },
    { id: "d3", cat: "drinks", name: "Крафтовое пиво", price: 260, desc: "Местная пивоварня, меняется раз в месяц." }
  ];

  var CART = [];

  /* ============ РЕНДЕР МЕНЮ ============ */
  var menuGrid = document.getElementById("menuGrid");
  var menuTabs = document.getElementById("menuTabs");
  var activeCat = "burgers";

  function renderMenu() {
    menuGrid.innerHTML = "";
    var items = MENU.filter(function (m) { return m.cat === activeCat; });
    items.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "menu-card reveal";
      var photoHtml = item.photo
        ? '<img src="' + item.photo + '?auto=format&fit=crop&w=480&q=75" ' +
          'srcset="' + item.photo + '?auto=format&fit=crop&w=360&q=75 360w, ' + item.photo + '?auto=format&fit=crop&w=480&q=75 480w" ' +
          'sizes="(max-width: 640px) 90vw, 340px" alt="' + escapeHtml(item.name) + '" loading="lazy" decoding="async" width="480" height="320">'
        : '<span>ФОТО · ' + escapeHtml(item.name) + '</span>';
      card.innerHTML =
        '<div class="menu-card__photo' + (item.photo ? " has-photo" : "") + '">' + photoHtml + '</div>' +
        '<div class="menu-card__body">' +
          '<div class="menu-card__top">' +
            '<span class="menu-card__name">' + escapeHtml(item.name) + '</span>' +
            '<span class="menu-card__price">' + item.price + ' ₽</span>' +
          '</div>' +
          '<p class="menu-card__desc">' + escapeHtml(item.desc) + '</p>' +
          '<button class="menu-card__add" data-id="' + item.id + '">Добавить в чек</button>' +
        '</div>';
      menuGrid.appendChild(card);
    });
    requestAnimationFrame(observeReveals);
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  menuTabs.addEventListener("click", function (e) {
    var btn = e.target.closest(".menu-tab");
    if (!btn) return;
    activeCat = btn.dataset.cat;
    Array.prototype.forEach.call(menuTabs.querySelectorAll(".menu-tab"), function (t) {
      t.classList.toggle("is-active", t === btn);
    });
    renderMenu();
  });

  menuGrid.addEventListener("click", function (e) {
    var btn = e.target.closest(".menu-card__add");
    if (!btn) return;
    var item = MENU.find(function (m) { return m.id === btn.dataset.id; });
    addToCart({ name: item.name, price: item.price, meta: "" });
    btn.classList.add("is-added");
    btn.textContent = "Добавлено ✓";
    setTimeout(function () {
      btn.classList.remove("is-added");
      btn.textContent = "Добавить в чек";
    }, 1200);
  });

  renderMenu();

  /* ============ КОНСТРУКТОР БУРГЕРА ============ */
  var PRICES = {
    bun: { classic: 0, charcoal: 40, glutenfree: 60 },
    patty: { beef: 0, doublebeef: 180, chicken: -20, veggie: 10 },
    cheese: { none: 0, cheddar: 40, smokedgouda: 60 },
    toppings: { bacon: 70, jalapeno: 30, onion: 25, pickles: 15, arugula: 20 },
    sauce: { none: 0, bbq: 0, garlic: 0, spicy: 0 }
  };
  var LABELS = {
    bun: { classic: "Классическая булка", charcoal: "Угольная булка", glutenfree: "Булка без глютена" },
    patty: { beef: "Говядина", doublebeef: "Двойная говядина", chicken: "Куриное бедро гриль", veggie: "Растительная котлета" },
    cheese: { none: "без сыра", cheddar: "чеддер", smokedgouda: "дымная гауда" },
    sauce: { none: "без соуса", bbq: "дымный BBQ", garlic: "чесночный майо", spicy: "острый деревенский" }
  };
  var BASE_PRICE = 340;

  var builderForm = document.getElementById("builder");
  var builderPriceEl = document.getElementById("builderPrice");
  var layerTopping = document.getElementById("layerTopping");
  var layerCheese = document.getElementById("layerCheese");
  var layerSauce = document.getElementById("layerSauce");
  var bunTopEl = document.querySelector('[data-layer="bunTop"]');

  function getSelection(group, multiple) {
    var inputs = builderForm.querySelectorAll('input[name="' + group + '"]');
    if (multiple) {
      var vals = [];
      inputs.forEach(function (i) { if (i.checked) vals.push(i.value); });
      return vals;
    }
    var checked = builderForm.querySelector('input[name="' + group + '"]:checked');
    return checked ? checked.value : null;
  }

  function updateBuilder() {
    var bun = getSelection("bun");
    var patty = getSelection("patty");
    var cheese = getSelection("cheese");
    var toppings = getSelection("toppings", true);
    var sauce = getSelection("sauce");

    var total = BASE_PRICE;
    total += PRICES.bun[bun] || 0;
    total += PRICES.patty[patty] || 0;
    total += PRICES.cheese[cheese] || 0;
    total += PRICES.sauce[sauce] || 0;
    toppings.forEach(function (t) { total += PRICES.toppings[t] || 0; });
    total = Math.max(total, 100);

    builderPriceEl.textContent = total + " ₽";
    builderPriceEl.dataset.value = total;

    layerCheese.hidden = cheese === "none";
    layerSauce.hidden = sauce === "none";
    layerTopping.hidden = toppings.length === 0;
    bunTopEl.classList.toggle("is-charcoal", bun === "charcoal");

    builderForm.dataset.summary = JSON.stringify({ bun: bun, patty: patty, cheese: cheese, toppings: toppings, sauce: sauce });
  }

  builderForm.addEventListener("change", updateBuilder);
  updateBuilder();

  document.getElementById("builderAdd").addEventListener("click", function () {
    var data = JSON.parse(builderForm.dataset.summary || "{}");
    var price = parseInt(builderPriceEl.dataset.value, 10) || BASE_PRICE;
    var metaParts = [];
    if (data.patty) metaParts.push(LABELS.patty[data.patty]);
    if (data.bun) metaParts.push(LABELS.bun[data.bun]);
    if (data.cheese) metaParts.push(LABELS.cheese[data.cheese]);
    if (data.sauce) metaParts.push(LABELS.sauce[data.sauce]);
    addToCart({ name: "Свой бургер", price: price, meta: metaParts.join(", ") });

    var btn = document.getElementById("builderAdd");
    var original = btn.textContent;
    btn.textContent = "Добавлено ✓";
    setTimeout(function () { btn.textContent = original; }, 1200);
  });

  /* ============ КОРЗИНА / ЧЕК ============ */
  var ticket = document.getElementById("ticket");
  var ticketBackdrop = document.getElementById("ticketBackdrop");
  var ticketItems = document.getElementById("ticketItems");
  var ticketEmpty = document.getElementById("ticketEmpty");
  var ticketTotal = document.getElementById("ticketTotal");
  var cartCount = document.getElementById("cartCount");

  function addToCart(entry) {
    entry.uid = Date.now() + Math.random().toString(16).slice(2);
    CART.push(entry);
    renderCart();
    openTicket();
  }

  function removeFromCart(uid) {
    CART = CART.filter(function (c) { return c.uid !== uid; });
    renderCart();
  }

  function renderCart() {
    cartCount.textContent = CART.length;
    ticketItems.innerHTML = "";
    if (CART.length === 0) {
      ticketItems.appendChild(ticketEmpty);
      ticketTotal.textContent = "0 ₽";
      return;
    }
    var total = 0;
    CART.forEach(function (item) {
      total += item.price;
      var row = document.createElement("div");
      row.className = "ticket-item";
      row.innerHTML =
        '<div>' +
          '<div class="ticket-item__name">' + escapeHtml(item.name) + '</div>' +
          (item.meta ? '<div class="ticket-item__meta">' + escapeHtml(item.meta) + '</div>' : '') +
        '</div>' +
        '<div class="ticket-item__right">' +
          '<span class="ticket-item__price">' + item.price + ' ₽</span>' +
          '<button class="ticket-item__remove" data-uid="' + item.uid + '">убрать</button>' +
        '</div>';
      ticketItems.appendChild(row);
    });
    ticketTotal.textContent = total + " ₽";
  }

  ticketItems.addEventListener("click", function (e) {
    var btn = e.target.closest(".ticket-item__remove");
    if (!btn) return;
    removeFromCart(btn.dataset.uid);
  });

  function openTicket() {
    ticket.classList.add("is-open");
    ticketBackdrop.classList.add("is-open");
  }
  function closeTicket() {
    ticket.classList.remove("is-open");
    ticketBackdrop.classList.remove("is-open");
  }

  document.getElementById("cartBtn").addEventListener("click", openTicket);
  document.getElementById("ticketClose").addEventListener("click", closeTicket);
  ticketBackdrop.addEventListener("click", closeTicket);

  document.getElementById("ticketCheckout").addEventListener("click", function () {
    if (CART.length === 0) return;
    alert("Заказ принят! Мы позвоним, чтобы подтвердить детали и время.");
    CART = [];
    renderCart();
    closeTicket();
  });

  renderCart();

  /* ============ ШАПКА: скролл-состояние + бургер-меню ============ */
  var header = document.getElementById("header");
  var nav = document.getElementById("nav");
  var burgerMenu = document.getElementById("burgerMenu");

  window.addEventListener("scroll", function () {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  });

  burgerMenu.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    burgerMenu.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest(".nav__link")) {
      nav.classList.remove("is-open");
      burgerMenu.setAttribute("aria-expanded", "false");
    }
  });

  /* ============ ШКАЛА ПРОЖАРКИ ============ */
  var heatFill = document.getElementById("heatFill");
  var heatLabel = document.getElementById("heatLabel");
  var HEAT_STAGES = [
    { at: 0, label: "СЫРОЙ" },
    { at: 0.33, label: "НА ОГНЕ" },
    { at: 0.66, label: "С ДЫМКОМ" },
    { at: 0.92, label: "ПРОЖАРЕНО" }
  ];

  function updateHeatGauge() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    heatFill.style.height = (pct * 100) + "%";
    var stage = HEAT_STAGES[0];
    HEAT_STAGES.forEach(function (s) { if (pct >= s.at) stage = s; });
    if (heatLabel.textContent !== stage.label) heatLabel.textContent = stage.label;
  }
  window.addEventListener("scroll", updateHeatGauge, { passive: true });
  window.addEventListener("resize", updateHeatGauge);
  updateHeatGauge();

  /* ============ ИСКРЫ В HERO ============ */
  var embersWrap = document.getElementById("embers");
  var EMBER_COUNT = 22;
  for (var i = 0; i < EMBER_COUNT; i++) {
    var e = document.createElement("span");
    e.className = "ember";
    e.style.left = (Math.random() * 100) + "%";
    e.style.setProperty("--drift", (Math.random() * 60 - 30) + "px");
    e.style.animationDuration = (5 + Math.random() * 6) + "s";
    e.style.animationDelay = (Math.random() * 8) + "s";
    e.style.opacity = (0.4 + Math.random() * 0.5).toFixed(2);
    embersWrap.appendChild(e);
  }

  /* ============ ОТЗЫВЫ: карусель ============ */
  var reviewsTrack = document.getElementById("reviewsTrack");
  document.getElementById("reviewNext").addEventListener("click", function () {
    reviewsTrack.scrollBy({ left: 380, behavior: "smooth" });
  });
  document.getElementById("reviewPrev").addEventListener("click", function () {
    reviewsTrack.scrollBy({ left: -380, behavior: "smooth" });
  });

  /* ============ ФОРМА БРОНИРОВАНИЯ ============ */
  var bookingForm = document.getElementById("bookingForm");
  var bookingSuccess = document.getElementById("bookingSuccess");

  function setError(fieldId, message) {
    var input = document.getElementById(fieldId);
    var field = input.closest(".field");
    var errorEl = bookingForm.querySelector('[data-error-for="' + fieldId + '"]');
    field.classList.toggle("has-error", !!message);
    errorEl.textContent = message || "";
  }

  bookingForm.addEventListener("input", function (e) {
    if (e.target.closest(".field")) {
      setError(e.target.id, "");
    }
  });

  bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();
    bookingSuccess.hidden = true;

    var name = document.getElementById("bkName").value.trim();
    var phone = document.getElementById("bkPhone").value.trim();
    var date = document.getElementById("bkDate").value;

    var valid = true;
    if (name.length < 2) { setError("bkName", "Укажите имя, минимум 2 символа"); valid = false; }
    var phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) { setError("bkPhone", "Проверьте номер телефона"); valid = false; }
    if (!date) { setError("bkDate", "Выберите дату"); valid = false; }
    else {
      var picked = new Date(date + "T00:00:00");
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (picked < today) { setError("bkDate", "Дата уже прошла"); valid = false; }
    }

    if (!valid) return;

    bookingSuccess.hidden = false;
    bookingForm.reset();
  });

  /* ============ РЕВИЛ ЭЛЕМЕНТОВ ПРИ СКРОЛЛЕ ============ */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  function observeReveals() {
    document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  document.querySelectorAll(
    ".process__step, .about__text, .about__photo, .review, .ph-photo, .section__head"
  ).forEach(function (el) { el.classList.add("reveal"); });

  observeReveals();
})();