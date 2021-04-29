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
        <calendar-heatmap :values="dailyCounts" :end-date="getToday()" tooltip-unit="titles" />
    </v-row>

    <!-- <v-row style="white-space: pre">
      {{ historyMap }}
    </v-row>

    <v-row style="white-space: pre">
      {{ dailyCounts }}
    </v-row> -->

  </v-container>
</template>

<script>
import { parseCSV } from "../utils/csvutils" 

export default {
  name: "Home",

  data: () => ({
    filename: null,
    historyMap: null,
  }),

  methods: {
    parseFile() {
      parseCSV(this.filename, (data) => {
        this.filedata = data;
        this.$toast.success("File uploaded!");
        // convert fileData to dictonary
        var map = {};
        for (var i = 1; i < data.length; i++) {
          // Date is the key
          let date = data[i][1], title = data[i][0];
          if (!date) continue;
          if (!map[date]) map[date] = [];
          map[date].push(title);
        }
        this.historyMap = map;
      }, (msg) => {
        this.$toast.error(msg);
      });
    },

    formatDate(date) {
      var parts = date.split("/");
      return parts[2] + "-" + parts[1] + "-" + parts[0];
    },

    getToday() {
      var currentDate = new Date()
      return currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate();  
    }
  },

  computed: {
    dailyCounts: function() {
      if (!this.historyMap) return null;
      var counts = [];
      var dates = Object.keys(this.historyMap);
      for (var i = 0; i < dates.length; i++) {
        counts.push({ date: this.formatDate(dates[i]), count: this.historyMap[dates[i]].length });
      }
      return counts;
    }
  }
};
</script>
