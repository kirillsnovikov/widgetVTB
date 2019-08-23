<template>
  <section class="check">
    <div :class="getClass" @click="applyOperation">OK</div>
  </section>
</template>

<script>
  export default {
    name: 'ok-button',
    props: {
      operation: Object,
      commentText: String
    },
    computed: {
      getClass() {
        var myclass;

        switch (true){
          case this.operation.OperationStatus == 'success': {
            myclass = 'check-btn-green';
            break;
          }
          case this.commentText != '': {
            myclass = 'check__ok-btn';
            break;
          }
          default: {
            myclass = 'check__inactive-ok';
          }
        }

        return myclass;
      }
    },
    methods: {
      applyOperation() {
        if (!(this.operation.Comment == true && this.commentText == '')) {
          this.$emit('apply-operation', this.operation.Index, this.commentText, 'success');
        }
      }
    }
  }
</script>