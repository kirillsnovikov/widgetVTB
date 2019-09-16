<template>
    <div @mousedown="mouseDownHeader(e)" class="header-layout">
        <div class="widget-header__main">
            <div class="widget-header__main__title">{{ClientName}}</div>
            <div class="widget-header__main__status">
                <div v-if="notificationNumberFlg" class="widget-header__main__status__number success">
                    <i class="icon-check"></i>
                    <span>Клиент звонит с доверенного номера</span>
                </div>
                <div v-if="!notificationNumberFlg" class="widget-header__main__status__number success">
                    <i class="icon-remove"></i>
                    <span>Клиент звонит с недоверенного номера</span>
                </div>
                <div
                    v-if="this.processStatus"
                    :class="'widget-header__main__status__operation ' +  (getStatusIsDanger ? 'danger' : 'success')">
                    <i v-if="getStatusIsDanger" class="icon-remove"></i>
                    <i v-if="!getStatusIsDanger" class="icon-check"></i>
                    <span>{{this.processStatus.Text}}</span>
                </div>
            </div>
        </div>
        <div
            class="widget-header__button"
            @click="collapseExpandWidget"
            @mouseenter="mouseEnterButton"
            @mouseleave="mouseLeaveButton"
            :class="{rotate: expanded}">
            <i class="icon-up"></i>
        </div>
    </div>
</template>

<script>
export default {
    name: "Header",
    props: {
        expanded: Boolean,
        ClientName: {
            type: String,
            default: "Неизвестный абонент"
        },
        processStatus: Object,
        notificationNumberFlg: Boolean
    },
    data() {
        return {
            isRotate: false
        };
    },
    computed: {
        getStatusIsDanger() {
            return [1, 2].includes(this.processStatus.Priority)
        }
    },
    methods: {
        collapseExpandWidget() {
            this.$emit("collapse-expand-widget");
            //this.isRotate = !this.isRotate;
        },
        mouseDownHeader(e) {
            this.$emit("mouse-down-header", e);
        },
        mouseEnterButton() {
            this.$emit("mouse-enter-button");
        },
        mouseLeaveButton() {
            this.$emit("mouse-leave-button");
        }
    }
};
</script>