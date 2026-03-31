Module.register("MMM-MyWastePickup", {
  defaults: {
    weeksToDisplay: 2,
    limitTo: 99,
    dateFormat: "D. MMM"
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
      typeContainer.innerHTML = pickup.Type;
      pickupContainer.appendChild(typeContainer);

      wrapper.appendChild(pickupContainer);
    }

    return wrapper;
  }
});