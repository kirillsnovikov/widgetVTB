<template>
  <div>
    <div v-if="currentOperationName !== ''" @click="setParent()">{{'<= ' + currentOperationName}}</div>
    <div v-for="(operation, i) in childrenOperations" @click="setOperation(operation['Operation Name'])">{{operation['Operation Name']}}</div>
  </div>
</template>

<script>
  export default {
    name: 'OperationLevel',
    props: {
      childrenOperations: Array,
      currentOperationName: String,
    },
    mounted() {
      console.log(this.childrenOperations)

    },
    methods: {
      getOperations(parentOperation) {
        // console.log(parentOperation)
        // this.$emit('getChildrenOperations', parentOperation)
      },
      setOperation(name) {
        console.log(name)
        this.$parent.selectedOperationName = name
      },
      setParent() {
        let result = this.$parent.operations.filter((operation) => {
          return operation['Operation Name'] == this.currentOperationName
        })
        this.setOperation(result[0]['Parent Operation'])
      }
    }
  }
</script>