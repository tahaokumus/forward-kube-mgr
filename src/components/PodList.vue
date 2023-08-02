<template>
  <div ref="headerRef" class="flex justify-between">
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

  <q-splitter
    v-model="splitterModel"
    horizontal
    :style="{
      height: splitterHeight + 'px',
    }"
    separator-style="height: 2px; background-color: #ff9800;"
    after-class=""
  >
    <template v-slot:before>
      <q-table
        v-if="podStore.getPods.length"
        v-model:selected="selected"
        :rows="podStore.getPods"
        color="dark"
        flat
        row-key="name"
        selection="multiple"
        :pagination="{
          rowsPerPage: 30,
        }"
      >
        <template v-slot:body-cell="props">
          <q-td :props="props">
            <div>
              <div :class="getStatusColor(props.value)">
                {{ props.value }}
              </div>
            </div>
          </q-td>
        </template>
      </q-table>
    </template>

    <template v-slot:after>
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
  </q-splitter>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { usePodsStore } from 'src/stores/pods'
import { useWindowSize, useElementSize } from '@vueuse/core'
import { useLogStore } from 'src/stores/log'

//#region Composables
const { loading } = useQuasar()
const podStore = usePodsStore()
const logStore = useLogStore()
const { height: screenHeight } = useWindowSize()
//#endregion

//#region Injects
//#endregion

//#region Props
//#endregion

//#region Emits
//#endregion

//#region Variables
const selectedPods = ref([])
const splitterModel = ref(70)
const headerRef = ref(null)
const { height: headerHeight } = useElementSize(headerRef)
//#endregion

//#region Methods
const getPods = async () => {
  try {
    const pods = await window.electron.getPods()
    podStore.setPods(pods.items)
  } catch (error) {
    logStore.addLog({
      message: error.message,
      type: 'error',
    })
  }
}
const checkKubeCtl = async () => {
  loading.show({
    message: 'Checking kubectl',
  })
  logStore.addLog({
    message: 'checking kubectl',
    type: 'info',
  })
  const kubeCtlExists = await window.electron.checkKubeCtlExists()
  if (!kubeCtlExists) {
    throw new Error('kubectl could not be found')
  }
  logStore.addLog({
    message: 'kubectl found',
    type: 'success',
  })
}
const deletePods = async () => {
  loading.show({
    message: 'Deleting pods',
  })
  const responses = await window.electron.deletePods(
    [...selected.value.map((pod) => pod.name)],
    namespace.value,
  )
  responses.forEach((response) => {
    logStore.addLog({
      message: response.message,
      type: response.type,
    })
  })
  selected.value = []
  loading.hide()
}
const getStatusColor = (status) => {
  switch (status) {
    case 'Running':
      return 'text-positive'
    case 'Pending':
      return 'text-warning'
    case 'Failed':
      return 'text-negative'
    default:
      return 'text-primary-color'
  }
}
const getLogColor = (type) => {
  switch (type) {
    case 'error':
      return 'text-negative'
    case 'info':
      return 'text-primary-color'
    case 'success':
      return 'text-positive'
    default:
      return 'text-primary-color'
  }
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
const splitterHeight = computed(() => {
  return screenHeight.value - headerHeight.value
})
//#endregion

//#region Watchers
//#endregion

//#region Lifecycle Hooks
//#endregion

//#region Created
checkKubeCtl()
  .then(async () => {
    loading.show({
      message: 'Getting pods',
    })
    logStore.addLog({
      message: 'getting pods',
      type: 'info',
    })
    await getPods()
    logStore.addLog({
      message: `found ${podStore.pods.length} pods`,
      type: 'success',
    })
    loading.hide()
    setInterval(() => {
      getPods()
    }, 1500)
  })
  .catch((err) => {
    console.error(err)
    logStore.addLog({
      message: err.message,
      type: 'error',
    })
    loading.hide()
  })
//#endregion

//#region Providers
//#endregion
</script>

<style lang="scss" scoped></style>
