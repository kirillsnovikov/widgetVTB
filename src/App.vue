<template>
  <div class="container" style="position: fixed;">
    <div v-if="renderLevel === 'first'">
      <OperationLevel :childrenOperations="getOperations(selectedOperationName)" :currentOperationName="selectedOperationName" />
    </div>
  </div>
</template>

<script>
  import outputData from './data/output'
  import OperationLevel from './components/OperationLevel.vue'


  // let div = document.createElement('div');
  // div.id = "app";
  // div.innerHTML = "<strong>Всем привет!</strong> Вы прочитали важное сообщение.";
  export default {
    name: 'app',
    components: {
      OperationLevel
    },
    data() {
      return {
        renderLevel: 'first',
        parentOperation: null,
        operations: outputData,
        selectedOperationName: ''
      }
    },
    computed: {
      // getParentName() {
      //   let result = this.operations.filter((operation) => {
      //     return operation['Parent Operation'] === this.selectedOperationName
      //   })
      //   console.log(result)
      //   return result["Operation Name"]
      // }
    },
    mounted() {
      // console.log(outputData)
    },
    methods: {
      getChildrenOperations() {
        // console.log('getChildrenOperations')
      },
      getOperations(ParentOperationName) {
        let result = this.operations.filter(function(operation) {
          return operation['Parent Operation'] === ParentOperationName
        })
        return result
      },
      // cloneSelectedName(){
      //   return this.selectedOperationName
      // }

    }
  }
</script>
