<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        Upload a viewing history CSV <a href="https://www.netflix.com/settings/viewed/" target="_blank" rel="noopener noreferrer">from Netflix</a>
        <div v-cloak @drop.prevent="addDropFile" @dragover.prevent>
          <v-file-input v-model="filename" accept=".csv" label="Click or drop file here"></v-file-input>
        </div>
        <v-btn color="primary" :disabled="!filename" @click="parseFile"
          >Upload</v-btn
        >
      </v-col>
    </v-row>

    <v-row v-if="!historyMap" justify="center">
      <v-img :src="require('../assets/netflixScreenshot.jpg')" max-width="800" />
    </v-row>

    <v-row v-if="historyMap" justify="center">
      <h2>{{ currYear }}</h2>
      <calendar-heatmap
        :values="dailyCounts"
        :end-date="maxDate"
        :tooltip-unit="unit"
        :max="settings.maxDays"
        @day-click="dayClick"
      />
    </v-row>
    <v-row v-if="historyMap" justify="center">
      <v-btn @click="currYear -= 1">Prev Year</v-btn>
      <v-btn @click="currYear += 1" :disabled="nextYearDisabled"
        >Next Year</v-btn
      >
    </v-row>

    <br>
    <br>

    <v-row v-if="historyMap" align="center" justify="center">
      <div>
        <span class="stats">Daily average: <span class="units">{{ dailyAverage.toFixed(1) }} {{ unit }}</span></span>
        <span class="stats">Longest streak: <span class="units">{{ longestStreak }} days</span></span>
        <span class="stats">Current streak: <span class="units">{{ currentStreak }} days</span></span>
      </div>
    </v-row>

    <br>
    <br>

    <v-row>
      <v-col v-if="dayList" align="center" justify="center">
        <h2>{{ currDay }}</h2>
        <v-list>
          <v-list-item v-for="title in dayList" :key="title">{{ title }}</v-list-item>
        </v-list>
      </v-col>

      <v-col v-if="historyMap" align="center" justify="center">
        <h2>Settings</h2>
        <br>
        <v-row align="center" justify="center">
          <v-text-field class="inputbox" label="Max colour threshold" v-model="input.maxDays" type="number" clearable />
        </v-row>
        <v-row align="center" justify="center">
          <v-text-field class="inputbox" label="Daily average start" v-model="input.minAvgDate" type="date" clearable />
        </v-row>
        <v-btn @click="updateSettings">Update</v-btn>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import { parseCSV } from "../utils/csvutils";

export default {
  name: "Home",

  data: () => ({
    filename: null,
    historyMap: null,
    currYear: null,
    unit: "titles",
    settings: {
      maxDays: null,
      minAvgDate: null
    },
    input: {
      maxDays: null,
      minAvgDate: null
    },
    dayList: null,
    currDay: null
  }),

  mounted() {
    if (localStorage.historyMap) {
      this.historyMap = JSON.parse(localStorage.historyMap);
    }
    if (localStorage.settings) {
      // Load settings and input form
      this.settings = JSON.parse(localStorage.settings);
      this.input = JSON.parse(localStorage.settings);
    }

    this.currYear = this.getCurrYear();
  },

  methods: {
    parseFile() {
      parseCSV(
        this.filename,
        (data) => {
          this.filedata = data;
          this.$toast.success("File uploaded!");
          // convert fileData to dictonary
          var map = {};
          for (var i = 1; i < data.length; i++) {
            // Date is the key
            let date = data[i][1],
              title = data[i][0];
            if (!date) continue;
            if (!map[date]) map[date] = [];
            map[date].push(title);
          }
          this.historyMap = map;
          // Save
          localStorage.historyMap = JSON.stringify(this.historyMap);
        },
        (msg) => {
          this.$toast.error(msg);
        }
      );
    },

    formatDate(date) {
      var parts = date.split("/");
      return parts[2] + "-" + parts[1] + "-" + parts[0];
    },

    getCurrYear() {
      var today = new Date();
      return today.getFullYear();
    },

    updateSettings() {
      this.settings.maxDays = parseInt(this.input.maxDays);
      this.settings.minAvgDate = this.input.minAvgDate;
      // Save settings
      localStorage.settings = JSON.stringify(this.settings);
      this.$toast.success("Settings updated!");
    },

    addDropFile(e) {
      this.filename = e.dataTransfer.files[0];
    },

    dayClick(e) {
      // Show what was watched on clicked day
      // TO DO: make date not dependant on region
      var dateFormatted = ("0" + e.date.getDate()).slice(-2) + "/" +
        ("0" + (e.date.getMonth() + 1)).slice(-2) + "/" + e.date.getFullYear();
      this.dayList = this.historyMap[dateFormatted];
      this.currDay = dateFormatted;
    },
  },

  computed: {
    dailyCounts: function () {
      if (!this.historyMap) return null;
      var counts = [];
      var dates = Object.keys(this.historyMap);
      for (var i = 0; i < dates.length; i++) {
        counts.push({
          date: this.formatDate(dates[i]),
          count: this.historyMap[dates[i]].length,
        });
      }
      return counts;
    },

    maxDate: function () {
      return this.currYear + "-12-31";
    },

    nextYearDisabled: function () {
      return this.currYear == this.getCurrYear();
    },

    dailyAverage: function () {
      var _dailyCounts = this.settings.minAvgDate ? this.dailyCounts.filter(x => new Date(x.date) > new Date(this.settings.minAvgDate)) : this.dailyCounts;
      var sum = _dailyCounts.map((x) => x.count).reduce((a, b) => a + b, 0);
      return sum / _dailyCounts.length || 0;
    },

    // ref: https://stackoverflow.com/a/58706306/6584553
    currentStreak() {
      let count = 0;
      // Try streak from today
      this.dailyCounts.forEach((el, i) => {
        if ((new Date().setUTCHours(0,0,0,0) - new Date(el.date).setUTCHours(0,0,0,0)) === i * 86400000) count++;
      })
      if (count > 0) return count;
      // Otherwise try streak from yesterday
      this.dailyCounts.forEach((el, i) => {
        if ((new Date().setUTCHours(0,0,0,0) - new Date(el.date).setUTCHours(0,0,0,0)) === (i + 1) * 86400000) count++;
      })
      return count;
    },

    longestStreak() {
      let count = 0;
      var max = 0;
      var endDate = new Date(this.dailyCounts[0].date).setUTCHours(0,0,0,0);
      var offset = 0;
      this.dailyCounts.forEach((el, i) => {
        if ((endDate - new Date(el.date).setUTCHours(0,0,0,0)) === (i - offset) * 86400000) {
          count++;
        } else {
          // If this date is not part of the streak, reset the streak counting
          if (count > max) {
            max = count;
          }
          count = 1;
          endDate = new Date(el.date).setUTCHours(0,0,0,0);
          offset = i;
        }
      })
      return max;
    },

  },
};
</script>

<style scoped>
.stats {
  margin: 10px;
}
.stats .units {
  font-weight: bold;
  color: var(--v-primary-base); 
}

.inputbox {
  max-width: 400px;
}
</style>