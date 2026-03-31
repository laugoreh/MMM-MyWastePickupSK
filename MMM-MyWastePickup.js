Module.register("MMM-MyWastePickup", {
  defaults: {
    weeksToDisplay: 2,
    limitTo: 99,
    dateFormat: "D. MMM",
    showIcons: true,
    iconMap: {
      "garbage": "garbage",
      "recycling": "recycle",
      "compost": "compost",
      "yard waste": "yard_waste",
      "christmas tree": "christmas_tree",
      "vyvoz komunalu": "garbage",
      "zber papier a plasty": "recycle"
    }
  },

  getStyles() {
    return ["MMM-MyWastePickup.css"];
  },

  start() {
    Log.info(`Starting module: ${this.name}`);

    this.nextPickups = [];
    this.initializing = true;
    this.timer = null;

    this.getPickups();
  },

  getPickups() {
    clearTimeout(this.timer);
    this.timer = null;

    this.sendSocketNotification("MMM-MYWASTEPICKUP-GET", {
      weeksToDisplay: this.config.weeksToDisplay,
      instanceId: this.identifier
    });

    this.timer = setTimeout(() => {
      this.getPickups();
    }, 60 * 60 * 1000);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === `MMM-MYWASTEPICKUP-RESPONSE${this.identifier}`) {
      this.nextPickups = payload;
      this.updateDom(1000);
    }
  },

  svgIconFactory(glyph) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttributeNS(null, "class", `waste-pickup-icon ${glyph}`);

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", `${this.file("icon_sprite.svg#")}${glyph}`);

    svg.appendChild(use);

    return svg;
  },

  getRelativeLabel(language, key, fallback) {
    const localeData = moment.localeData(language);
    const calendarFormat = localeData && localeData._calendar ? localeData._calendar[key] : null;

    if (!calendarFormat || typeof calendarFormat !== "string") {
      return fallback;
    }

    return calendarFormat
      .replace(/\[|\]/g, "")
      .replace(/LTS?/g, "")
      .replace(/\s+/g, " ")
      .replace(/\s+(at|o)\s*$/i, "")
      .trim();
  },

  normalizeWasteType(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  },

  getWasteIconGlyph(type) {
    const normalizedType = this.normalizeWasteType(type);
    const normalizedMap = Object.entries(this.config.iconMap || {}).reduce((result, [key, value]) => {
      result[this.normalizeWasteType(key)] = value;
      return result;
    }, {});

    if (normalizedMap[normalizedType]) {
      return normalizedMap[normalizedType];
    }

    if (/(papier|plast|recycl)/.test(normalizedType)) {
      return "recycle";
    }

    if (/(komunal|garbage|mixed|residual|general)/.test(normalizedType)) {
      return "garbage";
    }

    if (/(bio|compost)/.test(normalizedType)) {
      return "compost";
    }

    if (/(yard|garden|grass|leaf|branch|green)/.test(normalizedType)) {
      return "yard_waste";
    }

    if (/(christmas|viano)/.test(normalizedType)) {
      return "christmas_tree";
    }

    return null;
  },

  getPickupDateLabel(pickupDate, language) {
    const today = moment().startOf("day");
    const tomorrow = moment(today).add(1, "days");
    const nextWeek = moment(today).add(7, "days");
    const localizedPickupDate = moment(pickupDate).locale(language);

    if (today.isSame(localizedPickupDate)) {
      return this.getRelativeLabel(language, "sameDay", "today");
    }

    if (tomorrow.isSame(localizedPickupDate)) {
      return this.getRelativeLabel(language, "nextDay", "tomorrow");
    }

    if (nextWeek.isAfter(localizedPickupDate)) {
      return localizedPickupDate.format("dddd");
    }

    return localizedPickupDate.format(this.config.dateFormat);
  },

  getDom() {
    const wrapper = document.createElement("div");
    const language = String(this.config.language || config.language || "en").toLowerCase();

    if (this.initializing === true) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "dimmed light small";
      this.initializing = false;
      return wrapper;
    }

    if (this.nextPickups.length === 0) {
      console.error("[MMM-MyWastePickup] ERROR: No Schedule.");
      wrapper.innerHTML = "No schedule";
      wrapper.className = "light small";
      return wrapper;
    }

    for (const pickup of this.nextPickups.slice(0, this.config.limitTo)) {
      const pickupContainer = document.createElement("div");
      pickupContainer.classList.add("pickup-container");

      const dateContainer = document.createElement("span");
      dateContainer.classList.add("pickup-date");
      dateContainer.innerHTML = this.getPickupDateLabel(pickup.pickupDate, language);
      pickupContainer.appendChild(dateContainer);

      const typeContainer = document.createElement("span");
      typeContainer.classList.add("waste-pickup-type");

      if (this.config.showIcons) {
        const glyph = this.getWasteIconGlyph(pickup.Type);

        if (glyph) {
          typeContainer.appendChild(this.svgIconFactory(glyph));
        }
      }

      const labelContainer = document.createElement("span");
      labelContainer.classList.add("waste-pickup-label");
      labelContainer.textContent = pickup.Type;
      typeContainer.appendChild(labelContainer);

      pickupContainer.appendChild(typeContainer);

      wrapper.appendChild(pickupContainer);
    }

    return wrapper;
  }
});