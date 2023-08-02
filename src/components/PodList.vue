<template>
  <div class="flex justify-between">
    <q-btn
      v-show="selectedPods.length"
      color="negative"
      label="Delete"
      icon="delete"
      class="q-ma-md"
      :disable="!selectedPods.length"
      @click="deletePods"
    ></q-btn>

    <q-select
      v-if="podStore.getNamespaces.length"
      class="q-pa-md q-ml-auto flex-grow-3"
      style="max-width: 300px; flex-grow: 1"
      filled
      v-model="namespace"
      :options="podStore.getNamespaces"
      label="Namespace"
      dense
      @update:model-value="podStore.setNamespace($event)"
    />
  </div>

  <q-table
    v-if="podStore.getPods.length"
    flat
    bordered
    :rows="podStore.getPods"
    row-key="name"
    selection="multiple"
    v-model:selected="selected"
    :pagination="{
      rowsPerPage: 20,
    }"
  />
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { usePodsStore } from 'src/stores/pods'

//#region Composables
const { loading } = useQuasar()
const podStore = usePodsStore()
//#endregion

//#region Injects
//#endregion

//#region Props
//#endregion

//#region Emits
//#endregion

//#region Variables
const error = ref(null)
const selectedPods = ref([])
//#endregion

//#region Methods
const getPods = async () => {
  try {
    const pods = await window.electron.getPods()
    podStore.setPods(pods.items)
  } catch (error) {
    console.error(error)
    error.value = error.message
  }
}

const checkKubeCtl = async () => {
  loading.show({
    message: 'Checking kubectl',
  })
  const kubeCtlExists = await window.electron.checkKubeCtlExists()
  if (!kubeCtlExists) {
    error.value = 'Kubectl not found'
  } else {
    loading.hide()
  }
}

const deletePods = async () => {
  const res = await window.electron.deletePods(
    [...selected.value.map((pod) => pod.name)],
    namespace.value,
  )
  console.log(res)
  selected.value = []
}
//#endregion

//#region Computed Properties
const namespace = computed({
  get() {
    return podStore.getNamespace
  },
  set(value) {
    podStore.setNamespace(value)
  },
})
const selected = computed({
  get() {
    return podStore.getPods.filter((pod) =>
      selectedPods.value.includes(pod.name),
    )
  },
  set(value) {
    selectedPods.value = value.map((pod) => pod.name)
  },
})
//#endregion

//#region Watchers
//#endregion

//#region Lifecycle Hooks
//#endregion

//#region Created
checkKubeCtl().then(() => {
  getPods()
  setInterval(() => {
    getPods()
  }, 1500)
})
//#endregion

//#region Providers
//#endregion
</script>

<style lang="scss" scoped></style>
