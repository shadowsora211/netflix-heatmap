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

    <v-row style="white-space: pre">
      {{ filedata }}
    </v-row>
  </v-container>
</template>

<script>
import { parseCSV } from "../utils/csvutils" 

export default {
  name: "Home",

  data: () => ({
    filename: null,
    filedata: null,
  }),

  methods: {
    parseFile() {
      parseCSV(this.filename, (data) => {
        this.filedata = data;
        this.$toast.success("File uploaded!");
      }, (msg) => {
        this.$toast.error(msg);
      });
    },
  },
};
</script>
