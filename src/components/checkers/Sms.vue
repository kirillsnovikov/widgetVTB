<template>
    <section>
        <div
            :class="getSmsClass"
            @click="startSmsCountdown"
            >Запросить SMS - уведомление</div>
        <div
            :class="getCountdownClass"
            >До повторной попытки осталось {{this.operation.Seconds}} секунд(ы)</div>
        <input
            v-model="code"
            :placeholder="getPlaceholder"
            :readonly="getReadonly"
            :class="getInputClass">
        <div
            :class="getCheckClass"
            @click="checkCode"
            >Проверить код</div>
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
                let myclass = 'check__code-input ';

                switch (true) {
                    case this.operation.OperationStatus == 'success': {
                        myclass += 'check__code-input-success';
                        break;
                    }
                    case this.operation.OperationStatus == 'failed': {
                        myclass += 'check__code-input-failed';
                        break;
                    }
                    case this.operation.CodeSent: {
                        myclass += 'check__code-input-active';
                        break;
                    }
                    default: {
                        myclass += 'check__code-input-inactive';
                        break;
                    }
                }
                return myclass
            },
            getPlaceholder() {
                let text;

                switch (true) {
                    case this.operation.OperationStatus == 'success': {
                        text = 'Пройдено';
                        break;
                    }
                    case this.operation.OperationStatus == 'failed': {
                        text = 'Провалено';
                        break;
                    }
                    case this.operation.CodeSent: {
                        text = 'Введите код';
                        break;
                    }
                    default: {
                        text = 'Запросите код';
                    }
                }
                return text;
            },
            getReadonly() {
                if (this.operation.CodeSent && this.operation.OperationStatus == 'notselected')
                    return false;
                else
                    return true;
            },
            getCheckClass() {
                var myclass;
                //debugger;
                switch (true){
                    case this.operation.OperationStatus == 'success': {
                        myclass = 'check-btn-green';
                        break;
                    }
                    case this.operation.OperationStatus == 'failed': {
                        myclass = 'check-btn-red';
                        break;
                    }
                    case this.operation.CodeCheckInProgress: {
                        myclass = 'check-btn-blue-loading'
                        break;
                    }
                    case
                            this.code == '' ||
                            this.operation.CodeCheckInProgress ||
                            !this.operation.CodeSent
                        : {
                        myclass = 'check__inactive-ok';
                        break;
                    }
                    default: {
                        myclass = 'check__ok-btn';
                    }
                }

                return myclass + ' check__code-btn';
            }
        },
        methods: {
            startSmsCountdown() {
                if (this.operation.Interval == null && this.operation.OperationStatus == 'notselected')
                this.$emit('start-sms-countdown', this.operation.Index);
            },
            checkCode() {
                if (
                        this.operation.OperationStatus == 'notselected' &&
                        this.operation.CodeSent &&
                        !this.operation.CodeCheckInProgress &&
                        this.code != ''
                    ) {
                    this.$emit('check-code', this.operation.Index, this.code);
                }
            }
        },
        updated() {
            this.code = this.code.replace(/[^0-9\.]/g, '');
        }
    }
</script>