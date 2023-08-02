import { defineStore } from 'pinia'
import { uid } from 'quasar'

export const useLogStore = defineStore('logs', {
  state: () => ({
    logs: [],
  }),
  getters: {},
  actions: {
    addLog({ message, type = 'info' }) {
      this.logs.push({
        id: uid(),
        message,
        type,
      })
    },
  },
})
