<template>
    <div class="btn"
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
            operation: Object
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
            }
        }
    }
</script>