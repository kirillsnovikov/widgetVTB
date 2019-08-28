<template>
  <section>
    <div :class="getSmsClass" @click="startSmsCountdown">Запросить SMS - уведомление</div>
    <div :class="getCountdownClass">До повторной попытки осталось {{this.operation.Seconds}} секунд(ы)</div>
    <input v-model="code" :readonly="!this.operation.CodeSent" :class="getInputClass">
    <div :class="getCheckClass">Проверить код</div>
  </section>
</template>

<script>
import { setInterval, clearInterval } from 'timers';
  export default {
    name: 'Sms',
    data: function() {
      return {
        code: ''
      }
    },
    props: {
      operation: Object
    },
    computed: {
      getSmsClass() {
        return this.operation.Interval == null && this.operation.OperationStatus == 'notselected' ? 'check__sms-btn-active' : 'check__sms-btn-inactive';
        //return (this.operation.CodeSent == true || !(this.operation.Interval == null && this.operation.OperationStatus == 'notselected')) ? 'check__sms-btn-inactive' : 'check__sms-btn-active';
      },
      getCountdownClass() {
        return 'check__countdown ' + (this.operation.Interval == null ? 'check__countdown-inactive' : 'check__countdown-active');
      },
      getInputClass() {
        return 'check__code-input ' + (this.operation.CodeSent ? 'check__code-input-active'  : 'check__code-input-inactive');
      },
      getCheckClass() {
        var myclass;

        switch (true){
          case this.operation.OperationStatus == 'success': {
            myclass = 'check-btn-green';
            break;
          }
          case this.operation.OperationStatus == 'failed': {
            myclass = 'check-btn-red';
            break;
          }
          case this.operation.CodeSent: {
            myclass = 'check__ok-btn';
            break;
          }
          default: {
            myclass = 'check__inactive-ok';
          }
        }

        return myclass + ' check__code-btn';
      }
    },
    methods: {
      startSmsCountdown() {
        if (this.operation.Interval == null)
          this.$emit('start-sms-countdown', this.operation.Index);
      }
    },
    updated() {
      this.code = this.code.replace(/[^0-9\.]/g, '');
    }
  }
</script>