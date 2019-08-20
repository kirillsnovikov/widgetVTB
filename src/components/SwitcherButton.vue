<template>
  <div class="switcher-button">
    <input
    v-model="status"
    :id="`status_${switcher.Index}_1`"
    type="radio"
    :name="`switcher_${switcher.Index}`"
    value="denied">
    <input
    v-model="status"
    :id="`status_${switcher.Index}_2`"
    type="radio"
    :name="`switcher_${switcher.Index}`"
    value="disabled">
    <input
    v-model="status"
    :id="`status_${switcher.Index}_3`"
    type="radio"
    :name="`switcher_${switcher.Index}`"
    value="success">
    <div class="switcher-wrap" :class="getClass">
      <label class="switcher-area" :for="`status_${switcher.Index}_1`">
        <i class="icon-check" v-if="status === 'success'"></i>
      </label>
      <label class="switcher-area" :for="`status_${switcher.Index}_2`"></label>
      <label class="switcher-area" :for="`status_${switcher.Index}_3`">
        <i class="icon-remove"  v-if="status === 'denied'"></i>
      </label>
      <div class="switcher-toggle" :class="getToggleClass"></div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      switcher: Object
    },
    data() {
      return {
        status: 'disabled'
      }
    },
    computed: {
      getStatus() {
        return this.status
        console.log(this.status)
      },
      getClass() {
        return {
          'success-switcher': this.status === 'success',
          'error-switcher': this.status === 'denied',
        }
      },
      getToggleClass() {
        return {
          'success-toggle': this.status === 'success',
          'error-toggle': this.status === 'denied',
        }
      }
    }
  }
</script>