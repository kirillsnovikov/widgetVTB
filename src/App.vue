<template>
  <div class="widget-container">
    <div class="widget-header">

      <Header
      v-on:hide-widget-main="isShow = !isShow"/>

    </div>
    <div class="widget-main" v-if="isShow">

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
  import Header from './components/Header.vue'
  import OperationLevel from './components/OperationLevel.vue'

  export default {
    name: 'app',
    components: {
      Header,
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
