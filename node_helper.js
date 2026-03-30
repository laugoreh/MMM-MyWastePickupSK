var NodeHelper = require("node_helper");
var fs = require('fs');
var parse = require("csv-parse");
var moment = require("moment");


module.exports = NodeHelper.create({

  start: function() {
    console.log("Starting node_helper for module: " + this.name);

    this.schedule = null;

    // Load the waste pickup schedule from CSV file
    this.scheduleCSVFile = this.path + "/odpady.csv";

  },

  socketNotificationReceived: function(notification, payload) {

    var self = this;

    if (this.schedule == null) {
      //not yet setup. Load and parse the data file; set up variables.

      fs.readFile(this.scheduleCSVFile, "utf8", function(err, rawData) {
        if (err) throw err;
        parse(rawData, {delimiter: ",", columns: true, ltrim: false}, function(err, parsedData) {
          if (err) throw err;

          self.schedule = parsedData;
          self.postProcessSchedule();
          self.getNextPickups(payload);
        });
      });
    } else {
      this.getNextPickups(payload);
    }

  },

  postProcessSchedule: function() {

    this.schedule.forEach( function(obj) {

      // Convert date strings to moment.js Date objects
      // Expected format: MM/DD/YYYY
      obj.pickupDate = moment(obj["Start Date"], "MM/DD/YYYY");

      // Map waste type based on Subject field
      obj.Type = obj.Subject;

    });

  },

  getNextPickups: function(payload) {
    var start = moment().startOf("day"); //today, 12:00 AM
    var end = moment().startOf("day").add(payload.weeksToDisplay * 7, "days");

    //find info for next pickup dates
    var nextPickups = this.schedule.filter(function (obj) {
      return obj.pickupDate.isSameOrAfter(start) && 
        obj.pickupDate.isBefore(end);
    });

    // Sort by date
    nextPickups.sort(function(a, b) {
      return a.pickupDate - b.pickupDate;
    });

    this.sendSocketNotification('MMM-MYWASTEPICKUP-RESPONSE' + payload.instanceId, nextPickups);

  }

});