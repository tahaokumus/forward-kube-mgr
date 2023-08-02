import { contextBridge } from 'electron'
const { spawn } = require('child_process')

contextBridge.exposeInMainWorld('electron', {
  async checkKubeCtlExists() {
    return new Promise((resolve, reject) => {
      const command = spawn('kubectl', ['version'])
      command.on('close', (code) => {
        if (code === 0) {
          resolve(true)
        } else {
          reject(false)
        }
      })
    })
  },
  async getPods() {
    return new Promise((resolve, reject) => {
      const process = spawn(
        'kubectl',
        ['get', 'pods', '--all-namespaces', '-o', 'json'],
        {
          encoding: 'utf-8',
        },
      )

      let output = ''
      process.stdout.on('data', (data) => {
        output += data.toString()
      })
      process.stderr.on('data', (data) => {
        reject(data)
      })
      process.on('close', (code) => {
        if (code === 0) {
          resolve(JSON.parse(output))
        } else {
          reject(code)
        }
      })
    })
  },
  async deletePods(pods, env = 'staging') {
    return new Promise((resolve, reject) => {
      const output = []

      pods.forEach((pod) => {
        const process = spawn('kubectl', ['delete', 'pod', pod, '-n', env], {
          encoding: 'utf-8',
        })

        process.stdout.on('data', (data) => {
          output.push({ message: data.toString(), type: 'success' })
        })
        process.stderr.on('data', (data) => {
          output.push({ message: data.toString(), type: 'error' })
        })
        process.on('close', (code) => {
          if (code === 0) {
            resolve(output)
          } else {
            reject(code)
          }
        })
      })
    })
  },
})
