<template>
  <section class="check">
    <div class="check__yesno-btn">
      <div class="check__yesno-btn__left">Yes</div>
      <div class="check__yesno-btn__right">No</div>
    </div>
  </section>
</template>

<script>
  export default {
    name: 'yes-no',
    props: {
      operation: Object
    }
  }
</script>