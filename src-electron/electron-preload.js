import { contextBridge } from 'electron'

const k8s = require('@kubernetes/client-node')
const kc = new k8s.KubeConfig()
kc.loadFromDefault()

const k8sApi = kc.makeApiClient(k8s.CoreV1Api)

contextBridge.exposeInMainWorld('electron', {
  async getNamespaces() {
    const response = await k8sApi.listNamespace()
    return response.body.items
  },
  async getPods(namespace) {
    const response = await k8sApi.listNamespacedPod(namespace)
    return response.body.items
  },
  async deletePods(pods, env = 'staging') {
    const output = []

    for (const pod of pods) {
      const process = await k8sApi.deleteNamespacedPod(pod, env)
      console.log(process.response)

      if (process.response.statusCode === 200) {
        output.push({
          message: `deleted ${pod}`,
          type: 'warning',
        })
      } else {
        output.push({
          message: `pod ${pod} failed to delete, status code: ${process.response.statusCode}`,
          type: 'error',
        })
      }

      if (output.length === pods.length) {
        return output
      }
    }
  },
})
