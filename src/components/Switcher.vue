<template>
  <div class="switcher">
    <input v-model="status" id="status_1" type="radio" name="switcher" value="denied">
    <input v-model="status" id="status_2" type="radio" name="switcher" value="disabled">
    <input v-model="status" id="status_3" type="radio" name="switcher" value="success">
    <div class="switcher-wrap" :class="getClass">
      <label class="switcher-button" for="status_1">
        <i class="icon-check" v-if="status === 'success'"></i>
      </label>
      <label class="switcher-button" for="status_2"></label>
      <label class="switcher-button" for="status_3">
        <i class="icon-remove"  v-if="status === 'denied'"></i>
      </label>
      <div class="switcher-toggle" :class="getToggleClass"></div>
    </div>
    {{getStatus}}
  </div>
</template>

<script>
  export default {
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