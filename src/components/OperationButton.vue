<template>
    <div class="btn"
        v-if="isAvalible"
        :class="getClass"
        @click="setOperationIndex(operation.Index)">
        <span>{{operation.OperationName}}</span>
        <i class="icon-forward"></i>
        <!-- <i class="icon-forward" v-if="operation.ParentOperationIndex === null"></i>
        <i class="icon-arrow_right" v-if="operation.ParentOperationIndex !== null"></i> -->
  </div>
</template>

<script>
    export default {
        name: 'OperationButton',
        props: {
            operation: Object,
            appName: String
        },
        computed: {
            getClass() {
                let classes = 'btn-main-operation';

                switch (this.operation.OperationStatus){
                    case 'success': classes += ' btn-main-operation__success'; break;
                    case 'failed': classes += ' btn-main-operation__failed'; break;
                    case 'notselected': classes += ' btn-main-operation__notselected'; break;
                }
                return classes;
            }
        },
        methods: {
            setOperationIndex(index) {
                this.$emit('set-operation-index', index)
            },
            isAvalible () {
                let ACCfilter = (
                    this.appName == 'Siebel Universal Agent'
                    ||
                    (
                        this.appName == 'Outsource Call Center'
                        &&
                        this.operation.AvailableInACC
                    )
                )

                // if (this.appName == 'Outsource Call Center') {
                //     if (this.operation.AvailableInACC) ACC = true;
                // }
                // else ACC = true;

                return  ACCfilter;
            }
        }
    }
</script>