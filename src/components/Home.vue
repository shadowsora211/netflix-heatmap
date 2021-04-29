<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        Upload a viewing history CSV from Netflix
        <v-file-input v-model="filename" accept=".csv"></v-file-input>
        <v-btn color="primary" :disabled="!filename" @click="parseFile"
          >Upload</v-btn
        >
      </v-col>
    </v-row>

    <v-row v-if="historyMap" justify="center">
      <h2>{{ currYear }}</h2>
      <calendar-heatmap
        :values="dailyCounts"
        :end-date="maxDate"
        :tooltip-unit="unit"
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

    <v-row v-if="historyMap" justify="center">
      <div>Daily average: <span class="stats">{{ dailyAverage.toString() }} {{ unit }}</span></div>
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
  }),

  mounted() {
    if (localStorage.historyMap) {
      this.historyMap = JSON.parse(localStorage.historyMap);
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
      var sum = this.dailyCounts.map((x) => x.count).reduce((a, b) => a + b, 0);
      return sum / this.dailyCounts.length || 0;
    },
  },
};
</script>

<style scoped>
.stats {
  font-weight: bold;
  color: var(--v-primary-base);
}
</style>