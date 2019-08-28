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
        @set-operation-index="setOperationIndex"
        @apply-parameters="applyParameters"
        @apply-operation="applyOperation"
        @start-sms-countdown="startSmsCountdown"/>

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
      },
      applyParameters(indexes, id) {
        var stopperFound = false;

        function lockThisParameters(ths) {
          for (var i in indexes) {
            if (ths.operationsData.Parameters[i].ParameterStatus != 'notselected') {
              ths.operationsData.Parameters[i].Editable = false;
            }
          }
        }

        //ищем хотя бы одну проваленую операцию
        for (let i of indexes) {
          if (this.operationsData.Parameters[i].ParameterStatus == 'failed') {
            stopperFound = true;
            break;
          }
        }

        //если найдена проваленая операция, лочим все выбранные
        if (stopperFound) {
          lockThisParameters(this);
          this.operationsData.Operations[id].OperationStatus = 'failed'
        }
        else {
          for (let i in indexes) {
            if (this.operationsData.Parameters[i].ParameterStatus == 'notselected' && this.operationsData.Parameters[i].Required) {
              stopperFound = true;
              break;
            }
          }

          //если найден хотя бы один незаполненный обязательный параметр
          if (stopperFound) {
            console.log('Надо бы показать пользаку, что он невнимательный')
          }
          else {
            lockThisParameters(this);
            this.operationsData.Operations[id].OperationStatus = 'success'
          }
        }
      },
      applyOperation(index, text, newstatus) {
        this.operationsData.Operations[index].CommentText = text;
        this.operationsData.Operations[index].OperationStatus = newstatus;
      },
      startSmsCountdown(index) {
        this.operationsData.Operations[index].Interval = setInterval(() => {
          if (this.operationsData.Operations[index].Seconds == 0) {
            clearInterval(this.operationsData.Operations[index].Interval);
            this.operationsData.Operations[index].Interval = null;
            this.operationsData.Operations[index].Seconds = 15;
          }
          else {
            this.operationsData.Operations[index].Seconds -= 1;
          }
        }, 1000)
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
