<template>
    <div>
        <div
            v-if="renderSuspicionButton"
            class="check__sms-btn-active"
            @click="setFraudStatus('suspicion')"
            >Подозрение на мошенничество</div>
        <YesNo
            v-if="renderYesNo"
            @report-fraud="reportFraud"/>
        <div
            v-if="renderMailLayer"
            class="fraud_layer"
            :style="getMailLayerStyle">
            <!-- <div class="fraud_cross">
                <div @click="setFraudStatus('ok')"><i class="icon-remove"></i></div>
            </div> -->
            <div
                class="fraud_text">Уточните информацию о предположительном злоумышленнике. Информация будет направлена в службу безопасности</div>
            <div
                class="fraud_h">Суть обращения</div>
            <textarea
                class="check__textarea check__textarea-blue"
                v-model="requestText"></textarea>
            <div
                class="fraud_h">Что именно вызвало подозрение, что звонит не клиент?</div>
            <textarea
                class="check__textarea check__textarea-blue"
                v-model="suspicionText"></textarea>
            <div
                class="fraud_h">Произведена ли блокировка продуктов клиента?</div>
            <textarea
                class="check__textarea check__textarea-blue"
                v-model="blockedText"></textarea>
            <div
                :class="getBtnClass"
                @click="sendFraudMail">Отправить</div>
            <div
                v-if="fraudStatus == 'sending'"
                class="fraud_text"
                style="text-align: center; opacity: 0.6; font-size: 11px; padding-left: 15px">Идёт отправка письма</div>
        </div>
    </div>
</template>

<script>
    import YesNo from '@/components/checkers/YesNo'

    export default {
        name: 'Fraud',
        data() {
            return {
                requestText: '',
                suspicionText: '',
                blockedText: ''
            }
        },
        props: {
            fraudStatus: String
        },
        components: {YesNo},
        computed: {
            getMailLayerStyle() {
                return {
                    top: document.getElementsByClassName('widget-header')[0].offsetHeight + 20 + 'px',
                }
            },
            renderSuspicionButton() {
                return this.fraudStatus == 'ok' || this.fraudStatus == 'suspicion'
            },
            renderYesNo() {
                return this.fraudStatus == 'suspicion'
            },
            renderMailLayer() {
                return this.fraudStatus == 'confirmed' || this.fraudStatus == 'sending'
            },
            getBtnClass() {
                return 'fraud_button ' + (this.fraudStatus == 'sending' || this.requestText == '' || this.suspicionText == '' || this.blockedText == '' ? 'fraud_button_inactive' : 'fraud_button_active')
            }
        },
        methods: {
            reportFraud(reported) {
                if (reported == 'success') {
                    this.setFraudStatus('confirmed')
                }
                else this.setFraudStatus('ok')
            },
            setFraudStatus(newStatus) {
                this.$emit('set-fraud-status', newStatus);
            },
            sendFraudMail() {
                if (this.fraudStatus == 'confirmed' && this.requestText != '' && this.suspicionText != '' && this.blockedText != '')
                    this.$emit('send-fraud-mail', this.requestText, this.suspicionText, this.blockedText)
            }
        }
    }
</script>