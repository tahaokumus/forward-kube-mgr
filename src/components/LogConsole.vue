<template>
  <div class="bg-black full-height column-reverse q-pa-md overflow-auto">
    <div
      v-for="log in logStore.logs"
      :key="log.id"
      class="text-body1 text-weight-medium"
      :class="getLogColor(log.type)"
    >
      {{ log.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useLogStore } from 'src/stores/log'

//#region Composables
const logStore = useLogStore()
//#endregion

//#region Injects
//#endregion

//#region Props
//#endregion

//#region Emits
//#endregion

//#region Variables
//#endregion

//#region Methods
const getLogColor = (type) => {
  switch (type) {
    case 'error':
      return 'text-negative'
    case 'info':
      return 'text-primary-color'
    case 'success':
      return 'text-positive'
    case 'warning':
      return 'text-warning'
    default:
      return 'text-primary-color'
  }
}
//#endregion

//#region Computed Properties
//#endregion

//#region Watchers
//#endregion

//#region Lifecycle Hooks
//#endregion

//#region Created
//#endregion

//#region Providers
//#endregion
</script>

<style lang="scss" scoped></style>
