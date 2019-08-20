<template>
  <div class="switchers-layout">
    <div class="switcher" v-for="(switcher, i) in switchers" :key="switcher.ParameterName">
      <div class="switcher-text">{{switcher.ParameterName}}</div>
      <SwitcherButton :switcher="switcher"/>
    </div>
  </div>
</template>

<script>
  import SwitcherButton from './SwitcherButton'
  export default {
    components: {
      SwitcherButton
    },
    props: {
      switchers: Array
    },
  }
</script>