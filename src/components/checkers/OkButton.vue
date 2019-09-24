<template>
    <section class="check">
        <div
            v-if="operation.isWarningDisplaying && operation.Comment"
            class="check__text"
            >Для продолжения обслуживания необходимо указать причину</div>
        <div
            :class="getClass"
            @click="applyOperation">OK</div>
    </section>
</template>

<script>
    export default {
        name: 'OkButton',
        props: {
            operation: Object,
            commentText: String
        },
        computed: {
            getClass() {
                return this.operation.OperationStatus == 'success' ? 'check-btn-green' : 'check__ok-btn'
            }
        },
        methods: {
            applyOperation() {
                if (this.operation.Comment) {
                    if (this.commentText == '') {
                        this.$emit('show-warning', this.operation.Index);
                    }
                    else {
                        this.$emit('apply-operation', this.operation.Index, this.commentText, 'success');
                    }
                }
                else {
                    this.$emit('apply-operation', this.operation.Index, this.commentText, 'success');
                }
            }
        }
    }
</script>