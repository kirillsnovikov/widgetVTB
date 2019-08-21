<template>
  <div class="widget-main-operations">
    <transition name="operation-button" mode="out-in">
      <div class="btn btn-back"
      v-if="Object.keys(currentOperation).length !== 0"
      v-on:click="setOperationIndex(parentOperationIndex)"
      v-bind:key="currentOperation.OperationName">
      <i class="icon-back"></i>
      <span>{{currentOperation.OperationName}}</span>
    </div>
  </transition>
  <!-- <Switcher /> -->
  <transition-group name="operation-button" mode="out-in">
    <div class="btn"
    v-for="(operation, i) in operations"
    v-bind:class="getClass"
    v-on:click="setOperationIndex(operation.Index)"
    v-bind:key="operation.OperationName">
    <span>{{operation.OperationName}}</span>
    <i class="icon-forward" v-if="currentOperation.Index === null"></i>
    <i class="icon-arrow_right" v-if="currentOperation.Index !== null"></i>
  </div>
  <Switcher v-if="operations.length == 0 && parameters.length != 0" :switchers="parameters" v-bind:key="'switcher'"/>
  <component v-if="operations.length == 0 && parameters.length == 0" v-bind:is="currentOperation.CheckType" :key="currentOperation.CheckType"></component>
</transition-group>
</div>
</template>

<script>
  import Switcher from '@/components/Switcher'
  import YesNo from '@/components/checkers/YesNo'
  import Sms from '@/components/checkers/Sms'
  import OkButton from '@/components/checkers/OkButton'

  export default {
    name: 'OperationLevel',
    components: {
      Switcher,
      YesNo,
      Sms,
      OkButton,
    },
    props: {
      operations: Array,
      currentOperationIndex: Number,
      currentOperation: Object,
      parameters: Array,
      parentOperationIndex: Number,
    },
    methods: {
      setOperationIndex(index) {
        this.$emit('set-operation-index', index)
      }
    },
    computed: {
      getClass() {
        return {
          'btn-main-operation': this.currentOperationIndex === null,
          'btn-operation': this.currentOperationIndex !== null,
        }
      }
    }
  }
</script>