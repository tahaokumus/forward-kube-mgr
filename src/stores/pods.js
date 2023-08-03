import { defineStore } from 'pinia'
import moment from 'moment'
import { useLogStore } from './log'

export const usePodsStore = defineStore('pods', {
  state: () => ({
    _pods: [],
    namespaces: [],
    namespace: 'staging',
  }),
  getters: {
    pods() {
      return this._pods.map((pod) => {
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
  },
  actions: {
    setPods(pods) {
      this._pods = pods
    },
    setNamespace(namespace) {
      this.namespace = namespace
    },
    setNamespaces(namespaces) {
      this.namespaces = namespaces.map((namespace) => {
        return namespace.metadata.name
      })
    },
    async getNameSpaces() {
      const logStore = useLogStore()
      logStore.addLog({
        message: 'getting namespaces',
        type: 'info',
      })

      const namespaces = await window.electron.getNamespaces()
      this.setNamespaces(namespaces)

      logStore.addLog({
        message: `found ${namespaces.length} namespaces`,
        type: 'success',
      })
      return namespaces
    },
    async getPods(isSilent = false) {
      const logStore = useLogStore()
      if (!isSilent)
        logStore.addLog({
          message: `getting ${this.namespace} pods`,
          type: 'info',
        })

      const pods = await window.electron.getPods(this.namespace)
      this.setPods(pods)

      if (!isSilent)
        logStore.addLog({
          message: `found ${pods.length} pods`,
          type: 'success',
        })
      return pods
    },
    async deletePods(pods) {
      const logStore = useLogStore()
      logStore.addLog({
        message: 'deleting pods',
        type: 'info',
      })

      console.log(pods, this.namespace)

      const responses = await window.electron.deletePods(pods, this.namespace)

      responses.forEach((response) => {
        logStore.addLog({
          message: response.message,
          type: response.type,
        })
      })
    },
  },
})
