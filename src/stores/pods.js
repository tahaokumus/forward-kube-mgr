import { defineStore } from 'pinia'
import moment from 'moment'

export const usePodsStore = defineStore('pods', {
  state: () => ({
    pods: [],
    namespaces: [],
    namespace: 'staging',
  }),
  getters: {
    getPods() {
      return this.pods
        .filter((pod) => {
          return pod.metadata.namespace === this.namespace
        })
        .map((pod) => {
          const createdAt = pod.metadata.creationTimestamp
          const age = moment(createdAt).fromNow()
          const status = pod.status.phase
          return {
            name: pod.metadata.name,
            namespace: pod.metadata.namespace,
            status,
            created: age,
          }
        })
    },
    getNamespaces() {
      return this.namespaces
    },
    getNamespace() {
      return this.namespace
    },
  },
  actions: {
    setPods(pods) {
      this.pods = pods
      const uniqueNamespaces = [
        ...new Set(pods.map((pod) => pod.metadata.namespace)),
      ]
      this.namespaces = uniqueNamespaces
    },
    setNamespace(namespace) {
      this.namespace = namespace
    },
  },
})
