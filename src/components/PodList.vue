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
      v-if="podStore.namespaces.length"
      class="q-pa-md q-ml-auto flex-grow-3"
      style="max-width: 300px; flex-grow: 1"
      filled
      v-model="namespace"
      :options="podStore.namespaces"
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
        v-if="podStore.pods.length"
        v-model:selected="selected"
        :rows="podStore.pods"
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
      <LogConsole />
    </template>
  </q-splitter>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePodsStore } from 'src/stores/pods'
import { useWindowSize, useElementSize } from '@vueuse/core'
import { useLogStore } from 'src/stores/log'
import LogConsole from 'src/components/LogConsole.vue'

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
const getPods = async (isSilent) => {
  try {
    await podStore.getPods(isSilent)
  } catch (error) {
    logStore.addLog({
      message: error.message,
      type: 'error',
    })
  }
}
const getNamespaces = async () => {
  loading.show({
    message: 'Getting namespaces',
  })
  try {
    await podStore.getNameSpaces()
  } catch (error) {
    throw error
  }
}
const deletePods = async () => {
  loading.show({
    message: 'Deleting pods',
  })

  await podStore.deletePods(selectedPodNames.value)

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
//#endregion

//#region Computed Properties
const namespace = computed({
  get() {
    return podStore.namespace
  },
  set(value) {
    podStore.setNamespace(value)
  },
})
const selected = computed({
  get() {
    return podStore.pods.filter((pod) => selectedPods.value.includes(pod.name))
  },
  set(value) {
    selectedPods.value = value.map((pod) => pod.name)
  },
})
const selectedPodNames = computed(() => {
  return selected.value.map((pod) => pod.name)
})
const splitterHeight = computed(() => {
  return screenHeight.value - headerHeight.value
})
//#endregion

//#region Watchers
watch(
  () => namespace.value,
  async () => {
    await getPods()
  },
)
//#endregion

//#region Lifecycle Hooks
onMounted(() => {
  getNamespaces()
    .then(async () => {
      loading.show({
        message: 'Getting pods',
      })

      await getPods()

      loading.hide()
      setInterval(() => {
        getPods(true)
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
})
//#endregion

//#region Created
//#endregion

//#region Providers
//#endregion
</script>

<style lang="scss" scoped></style>
