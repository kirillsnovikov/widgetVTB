<template>
    <section class="check">
        <div class="check__yesno-btn">
            <div
                :class="getYesClass"
                @click="applyOperationReportFraud('success')">Да</div>
            <div
                :class="getNoClass"
                @click="applyOperationReportFraud('failed')">Нет</div>
        </div>
    </section>
</template>

<script>
    export default {
        name: 'yes-no',
        props: {
            operation: Object
        },
        computed: {
            getYesClass(){
                var myclass;

                if (this.operation == null) {
                    myclass = 'check__yesno-btn__left';
                }
                else switch (this.operation.OperationStatus) {
                    case 'success': {
                        myclass = 'check__yesno-btn__match_left'
                        break;
                    }
                    case 'notselected': {
                        myclass = 'check__yesno-btn__left';
                        break;
                    }
                    case 'failed': {
                        myclass = 'check__yesno-btn__inactive_left'
                        break;
                    }
                }

                return myclass;
            },
            getNoClass(){
                var myclass;

                if (this.operation == null) {
                    myclass = 'check__yesno-btn__right';
                }
                else switch (this.operation.OperationStatus) {
                    case 'success': {
                        myclass = 'check__yesno-btn__inactive_right'
                        break;
                    }
                    case 'notselected': {
                        myclass = 'check__yesno-btn__right';
                        break;
                    }
                    case 'failed': {
                        myclass = 'check__yesno-btn__match_right'
                        break;
                    }
                }

                return myclass;
            }
        },
        methods: {
            applyOperationReportFraud(newStatus) {
                if (this.operation == null) {
                    this.$emit('report-fraud', newStatus);
                }
                else {
                    if (
                        !(this.operation.Comment == true && this.commentText == '') &&
                        this.operation.OperationStatus == 'notselected'
                    ) {
                        this.$emit('apply-operation', this.operation.Index, this.commentText, newStatus);
                    }
                }
            }
        }
    }
</script>