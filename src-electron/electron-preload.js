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
  async getPods(env = 'staging') {
    return new Promise((resolve, reject) => {
      const process = spawn(
        'kubectl',
        ['get', 'pods', '-n', env, '-o', 'json'],
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
})
