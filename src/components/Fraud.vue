<template>
    <div style="margin-top: 20px;">
        <div
            v-if="renderSuspectionButton"
            class="check__sms-btn-active"
            @click="status = 'suspection'"
            >Подозрение на мошенничество</div>
        <YesNo
            v-if="renderYesNo"
            @report-fraud="reportFraud"/>
        <div
            v-if="renderMailLayer"
            :style="getMailLayerStyle"></div>
    </div>
</template>

<script>
    import YesNo from '@/components/checkers/YesNo'
import { ok } from 'assert';

    export default {
        name: 'Fraud',
        data() {
            return {
                // ok
                // suspection
                // confirmed
                // sent
                status: 'ok'
            }
        },
        components: {YesNo},
        computed: {
            getMailLayerStyle() {
                return {
                    width: '265px',
                    height: '380px',
                    position: 'absolute',
                    top: document.getElementsByClassName('widget-header')[0].offsetHeight + 20 + 'px',
                    'background-color': 'rgba(0, 200, 0, 0.5)'
                }
            },
            renderSuspectionButton() {
                return this.status == 'ok' || this.status == 'suspection'
            },
            renderYesNo() {
                return this.status == 'suspection'
            },
            renderMailLayer() {
                return this.status == 'confirmed'
            }
        },
        methods: {
            reportFraud(reported) {
                console.log('Fraud', reported)
                if (reported == 'success') {
                    this.status = 'confirmed'
                }
                else this.status = 'ok'
            }
        }
    }
</script>