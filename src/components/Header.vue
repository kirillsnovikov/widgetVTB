<template>
  <div class="header-layout">
    <div class="widget-header__main">
      <div class="widget-header__main__title">Иванов Иван</div>
      <div class="widget-header__main__status">
        <div class="widget-header__main__status__number success">
          <i class="icon-check"></i>
          Клиент звонит с доверенного номера
        </div>
        <div class="widget-header__main__status__operation danger">
          <i class="icon-remove"></i>
          Аутентификация не проводилась
        </div>
      </div>
    </div>
    <div class="widget-header__button" @click="hideWidget" :class="{rotate: isRotate}">
      <i class="icon-up"></i>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Header',
    data() {
      return {
        isRotate: false,
      }
    },
    methods: {
      hideWidget() {
        this.$emit('hide-widget-main')
        this.isRotate = !this.isRotate
      }
    }
  }
</script>