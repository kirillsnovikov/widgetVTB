<template>
  <div class="switchers-layout">
    <div class="switcher" v-for="(switcher) in switchers" :key="switcher.ParameterName">
      <div class="switcher-text">{{switcher.ParameterName}}</div>
      <SwitcherButton :switcher="switcher"/>
    </div>
    <div class="check__ok-btn" @click="applyParameters">OK</div>
  </div>
</template>

<script>
  import SwitcherButton from './SwitcherButton'
  export default {
    components: {
      SwitcherButton
    },
    props: {
      switchers: Array,
      operation: Object
    },
    data() {
      return {
        // apply: false
      }
    },
    methods: {
      applyParameters() {
        this.$emit('apply-parameters', this.operation.ParametersIndexes, this.operation.Index);
      }
    }
  }
</script>