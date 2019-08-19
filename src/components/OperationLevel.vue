<template>
  <div>
    <transition name="operation-button" mode="out-in">
      <div
      class="btn btn-back"
      v-if="currentOperationName !== ''"
      @click="setOperationName(parentOperationName)"
      :key="currentOperationName">
        {{'<=\'back\' ' + currentOperationName}}
      </div>
    </transition>
    <transition-group name="operation-button" mode="out-in">
      <div
      class="btn"
      :class="getClass"
      v-for="(operation, i) in operations"
      @click="setOperationName(operation['Operation Name'])"
      :key="operation['Operation Name'] + i">
        {{operation['Operation Name']}}
      </div>
    </transition-group>
    <Switcher />
  </div>
</template>

<script>
  import Switcher from '@/components/Switcher'
  export default {
    name: 'OperationLevel',
    components: {
      Switcher,
    },
    props: {
      operations: Array,
      currentOperationName: String,
      parentOperationName: String,
    },
    methods: {
      setOperationName(name) {
        this.$emit('set-operation-name', name)
      }
    },
    mounted() {
      console.log(this.operations)
    },
    computed: {
      getClass() {
        return {
          'btn-main-operation': this.currentOperationName === '',
          'btn-operation': this.currentOperationName !== '',
        }
      }
    }
  }
</script>