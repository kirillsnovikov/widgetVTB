<template>
  <div class="switcher-button">
    <input
    v-model="status"
    :id="`status_${switcher.Index}_1`"
    type="radio"
    :name="`switcher_${switcher.Index}`"
    value="failed">
    <input
    v-model="status"
    :id="`status_${switcher.Index}_2`"
    type="radio"
    :name="`switcher_${switcher.Index}`"
    value="notselected">
    <input
    v-model="status"
    :id="`status_${switcher.Index}_3`"
    type="radio"
    :name="`switcher_${switcher.Index}`"
    value="success">
    <div class="switcher-wrap" :class="getClass">
      <div class="switcher-lock" v-if="!switcher.Editable"></div>
      <label class="switcher-area" :for="`status_${switcher.Index}_1`">
        <i class="icon-remove" v-if="status === 'notselected'"></i>
      </label>
      <label class="switcher-area" :for="`status_${switcher.Index}_2`">
      </label>
      <label class="switcher-area" :for="`status_${switcher.Index}_3`">
        <i class="icon-check" v-if="status === 'notselected'"></i>
      </label>
      <div class="switcher-toggle" :class="getToggleClass">
        <div class="icons">
          <transition name="icon-show">
            <i class="icon-check" v-if="status === 'success' && switcher.Editable"></i>
            <i class="icon-remove"  v-if="status === 'failed' && switcher.Editable"></i>
            <i class="icon-lock"  v-if="!switcher.Editable"></i>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      switcher: Object,
    },
    data() {
      return {
        status: this.switcher.ParameterStatus,
      }
    },
    watch: {
    },
    updated() {
      this.switcher.ParameterStatus = this.status

        // this.switcher.Editable = false
    },
    computed: {
      getClass() {
        return {
          'success-switcher': this.status === 'success',
          'error-switcher': this.status === 'failed',
        }
      },
      getToggleClass() {
        return {
          'success-toggle': this.status === 'success',
          'error-toggle': this.status === 'failed',
        }
      },
    }
  }
</script>