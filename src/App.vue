<template>
  <div class="widget-container" style="position: fixed;">
    <div class="header">
      <div @click="isShow = !isShow">^^^Развернуть^^^</div>
    </div>
    <div class="main-layout" v-if="isShow">

      <OperationLevel
      :operations="getCurrentOperations"
      :currentOperationName="selectedOperationName"
      :parentOperationName="getParentOperationName"
      v-on:set-operation-name="setOperationName"/>

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
        isShow: true
      }
    },
    computed: {
      // поместить в один метод присваивание названия родительской и передачу текущих операций
      getCurrentOperations() {
        let result = this.operationsData.filter((operation) => {
          return operation['Parent Operation'] === this.selectedOperationName
        })
        return result
      },
      getParentOperationName() {
        let parentOperation = this.operationsData.find(operation => {
          return operation['Operation Name'] === this.selectedOperationName
        })
        if (parentOperation) {
          return parentOperation['Parent Operation']
        }
      }
    },
    methods: {
      setOperationName(name) {
        this.selectedOperationName = name
      }
    },
  }
</script>
