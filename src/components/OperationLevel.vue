<template>
  <div>
    <div class="btn" v-if="currentOperationName !== ''" @click="setOperationName(parentOperationName)">
      {{'<=\'back\' ' + currentOperationName}}
    </div>
    <div v-for="(operation, i) in operations" @click="setOperationName(operation['Operation Name'])">
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
      parentOperationName: String,
    },
    methods: {
      setOperationName(name) {
        this.$emit('set-operation-name', name)
      }
    }
  }
</script>

<style lang="scss">
.btn {
  background: blue;
}
</style>