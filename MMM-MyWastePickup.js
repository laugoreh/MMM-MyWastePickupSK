Module.register('MMM-MyWastePickup', {

  defaults: {
    weeksToDisplay: 2,
    limitTo: 99,
    dateFormat: "D. MMM"
  },

  // Define required styles.
  getStyles: function () {
    return ["MMM-MyWastePickup.css"];
  },  

  start: function() {
    Log.info('Starting module: ' + this.name);

    this.nextPickups = [];
    this.initializing = true;

    this.getPickups();

    this.timer = null;

  },

  getPickups: function() {

    clearTimeout(this.timer);
    this.timer = null;

    this.sendSocketNotification("MMM-MYWASTEPICKUP-GET", {weeksToDisplay: this.config.weeksToDisplay, instanceId: this.identifier});

    //set alarm to check again tomorrow
    var self = this;
    this.timer = setTimeout( function() {
      self.getPickups();
    }, 60 * 60 * 1000); //update once an hour
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification == "MMM-MYWASTEPICKUP-RESPONSE" + this.identifier) {
      this.nextPickups = payload;
      this.updateDom(1000);
    }
  },

  svgIconFactory: function(glyph) {

    var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttributeNS(null, "class", "waste-pickup-icon " + glyph);
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", this.file("icon_sprite.svg#") + glyph);
    svg.appendChild(use);
    
    return(svg);
  },   

  getRelativeLabel: function(language, key, fallback) {
    var localeData = moment.localeData(language);
    var calendarFormat = localeData && localeData._calendar ? localeData._calendar[key] : null;

    if (!calendarFormat || typeof calendarFormat !== "string") {
      return fallback;
    }

    return calendarFormat
      .replace(/\[|\]/g, "")
      .replace(/LTS?/g, "")
      .replace(/\s+(at|o)$/i, "")
      .replace(/\s+/g, " ")
      .trim();
  },

  getDom: function() {
    var wrapper = document.createElement("div");
    var language = ((this.config.language || config.language || "en") + "").toLowerCase();

    if (this.initializing == true) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "dimmed light small";
      this.initializing = false;
      return wrapper;
    }

    if(this.nextPickups.length == 0) {
      console.error("[MMM-MyWastePickup] ERROR: No Schedule.");
      wrapper.innerHTML = "No schedule";
      wrapper.className = "light small";
      return wrapper;
    }

    // this.nextPickups.forEach( function(pickup) {
    for (var i = 0; i < this.nextPickups.length; i++) {

      if (i == this.config.limitTo) {
        break;
      }

      var pickup = this.nextPickups[i];

      var pickupContainer = document.createElement("div");
      pickupContainer.classList.add("pickup-container");

      //add pickup date
      var dateContainer = document.createElement("span");
      dateContainer.classList.add("pickup-date");

      //determine how close pickup day is and formats accordingly.
      var today = moment().startOf("day");
      var pickUpDate = moment(pickup.pickupDate).locale(language);
      if (today.isSame(pickUpDate)) {
        dateContainer.innerHTML = this.getRelativeLabel(language, "sameDay", "today");
      } else if (moment(today).add(1, "days").isSame(pickUpDate)) {
        dateContainer.innerHTML = this.getRelativeLabel(language, "nextDay", "tomorrow");
      } else if (moment(today).add(7, "days").isAfter(pickUpDate)) {
        dateContainer.innerHTML = pickUpDate.format("dddd");
      } else {
        dateContainer.innerHTML = pickUpDate.format(this.config.dateFormat);
      }

      pickupContainer.appendChild(dateContainer);

      //add waste type
      var typeContainer = document.createElement("span");
      typeContainer.classList.add("waste-pickup-type");
      typeContainer.innerHTML = pickup.Type;

      pickupContainer.appendChild(typeContainer);

      wrapper.appendChild(pickupContainer);

    }

    return wrapper;
  }

});