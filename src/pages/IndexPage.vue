<template>
  <q-page class="flex flex-center">
    <q-btn color="primary" label="Get pods" @click="getPods" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const { loading } = useQuasar()

const isLoading = ref(true)
const error = ref(null)

const getPods = async () => {
  loading.show({
    message: 'Getting pods',
  })
  const pods = await window.electron.getPods()
  console.log(pods)
  loading.hide()
}

const checkKubeCtl = async () => {
  loading.show({
    message: 'Checking kubectl',
  })
  const kubeCtlExists = await window.electron.checkKubeCtlExists()
  if (!kubeCtlExists) {
    error.value = 'Kubectl not found'
  } else {
    isLoading.value = false
    loading.hide()
  }
}

checkKubeCtl()
</script>
