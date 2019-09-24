<template>
    <div class="switchers-layout">
        <div
            class="switcher"
            v-for="(switcher) in switchers"
            :key="switcher.ParameterName">
        <div
            class="switcher-text">{{switcher.ParameterName}}</div>
        <SwitcherButton :switcher="switcher"/>
        </div>
        <div
            v-if="operation.isWarningDisplaying"
            class="check__text"
            >Необходимо опросить клиента по всем обязательным параметрам аутентификации</div>
        <div
            :class="getBtnClass"
            @click="applyParameters">OK</div>
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
        computed: {
            getBtnClass() {
                let bclass;
                switch (this.operation.OperationStatus) {
                    case 'success': bclass = 'check-btn-green'; break;
                    case 'failed': bclass = 'check-btn-red'; break;
                    case 'notselected': bclass = 'check__ok-btn'; break;
                }
                return bclass;
            }
        },
        methods: {
            applyParameters() {
                if (this.operation.OperationStatus == 'notselected')
                    this.$emit('apply-parameters', this.operation.ParametersIndexes, this.operation.Index);
            }
        }
    }
</script>