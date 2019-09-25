<template>
    <div class="btn"
        v-if="isAvalible"
        :class="getClass"
        @click="setOperationIndex(operation.Index)">
        <span>{{operation.OperationName}}</span>
        <i class="icon-forward"></i>
  </div>
</template>

<script>
    export default {
        name: 'OperationButton',
        props: {
            operation: Object,
            isAvalible: Boolean
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