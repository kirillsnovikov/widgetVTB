<template>
  <div>
    <div v-if="currentOperationName !== ''" @click="setParent()">
      {{'<=\'back\' ' + currentOperationName}}
    </div>
    <div v-for="(operation, i) in operations" @click="setSelectOperationName(operation['Operation Name'])">
      {{operation['Operation Name']}}
    </div>
  </div>
</template>

<script>
  export default {
    name: 'OperationLevel',
    props: {
      operations: Array,
      currentOperationName: String,
    },
    mounted() {
      console.log(this.operations)

    },
    methods: {
      getOperations(parentOperation) {
      },
      setSelectOperationName(name) {
        // this.$emit('setSelectOperationName')
        this.$parent.selectedOperationName = name
      },
      setParent() {
        let result = this.$parent.operationsData.filter((operation) => {
          return operation['Operation Name'] == this.currentOperationName
        })
        this.setSelectOperationName(result[0]['Parent Operation'])
      }
    }
  }
</script>