<template>
  <div class="container" style="position: fixed;">
    <div class="header">
      <div @click="isShow = !isShow">^^^Развернуть^^^</div>
    </div>
    <div class="main-container" v-if="isShow">

      <OperationLevel
      :operations="getCurrentOperations"
      :currentOperationName="selectedOperationName"/>

    </div>
  </div>
</template>

<script>
  import outputData from './data/output'
  import OperationLevel from './components/OperationLevel.vue'

  export default {
    name: 'app',
    components: {
      OperationLevel
    },
    data() {
      return {
        operationsData: outputData,
        selectedOperationName: '',
        isShow: false
      }
    },
    computed: {
      getCurrentOperations() {
        let result = this.operationsData.filter((operation) => {
          return operation['Parent Operation'] === this.selectedOperationName
        })
        return result
      }
    }
  }
</script>
