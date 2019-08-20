<template>
  <div class="widget-container">
    <div class="widget-header">

      <Header
      v-on:hide-widget-main="isShow = !isShow"
      :ClientName="operationsData.ClientName"/>

    </div>
    <transition name="show-widget">
      <div class="widget-main" v-if="isShow">

        <OperationLevel
        :operations="getCurrentOperations"
        :currentOperationIndex="operationsData.SelectedOperationIndex"
        :currentOperation="getCurrentOperation"
        :parameters="getParameters"
        :parentOperationIndex="getParentOperationIndex"
        v-on:set-operation-index="setOperationIndex"/>

      </div>
    </transition>
  </div>
</template>

<script>
  import outputData from './data/output_formated'
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
        isShow: true
      }
    },
    mounted() {
    },
    methods: {
      setOperationIndex(index) {
        this.operationsData.SelectedOperationIndex = index
      }
    },
    computed: {
      getCurrentOperations() {
        let result = this.operationsData.Operations.filter((operation) => {
          return operation.ParentOperationIndex === this.operationsData.SelectedOperationIndex
        })
        return result
      },
      getCurrentOperation() {
        let result
        if (this.operationsData.SelectedOperationIndex !== null) {
          result = this.operationsData.Operations[this.operationsData.SelectedOperationIndex]
        } else {
          result = {}
        }
        return result
      },
      getParentOperationIndex() {
        let parentOperation = this.operationsData.Operations.find(operation => {
          return operation.Index === this.operationsData.SelectedOperationIndex
        })
        if (parentOperation) {
          return parentOperation.ParentOperationIndex
        } else {
          return null
        }
      },
      getParameters() {
        if (Object.keys(this.getCurrentOperation).length !== 0) {
          return this.getCurrentOperation.ParametersIndexes.map((parameterIndex) => {
            return this.operationsData.Parameters[parameterIndex]
          })
        }
      },
    }
  }
</script>
