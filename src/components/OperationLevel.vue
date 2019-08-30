<template>
  <!-- <div class="widget-main-operations"> -->
    <div>
        <transition name="operation-button" mode="out-in">
            <div
                v-if="Object.keys(currentOperation).length !== 0"
                :class="getClass"
                :key="currentOperation.OperationName"
                @click="setOperationIndex(parentOperationIndex)">
                <i class="icon-back"></i>
                <span>{{currentOperation.OperationName}}</span>
            </div>
        </transition>
        <transition-group name="operation-button" mode="out-in">
            <OperationButton
                v-for="operation in operations"
                :key="operation.OperationName"
                @set-operation-index="setOperationIndex"
                :operation="operation"></OperationButton>
            <Switcher
                v-if="operations.length == 0 && parameters.length != 0"
                :switchers="parameters"
                :operation="currentOperation"
                :key="'switcher'"
                @apply-parameters="applyParameters"/>
            <section
                v-if="operations.length == 0 && parameters.length == 0"
                :key="'section_' + currentOperation.CheckType">
                <div class="check__text">{{currentOperation.OperationText}}</div>
                <textarea
                    v-if="currentOperation.Comment == true"
                    v-model="commentText"
                    :class="getTextareaClass"
                    :placeholder="currentOperation.HintText"
                    :readonly="getReadonly"
                    ></textarea>
                <component
                    :is="currentOperation.CheckType"
                    :key="currentOperation.CheckType"
                    :operation="currentOperation"
                    :commentText="commentText"
                    @apply-operation="applyOperation"
                    @start-sms-countdown="startSmsCountdown"
                    @check-code="checkCode"></component>
            </section>
        </transition-group>
    </div>
</template>

<script>
    import Switcher from '@/components/Switcher'
    import YesNo from '@/components/checkers/YesNo'
    import Sms from '@/components/checkers/Sms'
    import OkButton from '@/components/checkers/OkButton'
    import OperationButton from '@/components/OperationButton'

  export default {
        name: 'OperationLevel',
        data() {
            return {
                commentText: '',
                hint: this.currentOperation.HintText
            }
        },
        components: {
            Switcher,
            YesNo,
            Sms,
            OkButton,
            OperationButton
        },
        props: {
            operations: Array,
            currentOperationIndex: Number,
            currentOperation: Object,
            parameters: Array,
            parentOperationIndex: Number,
        },
        computed: {
            getClass() {
                let classes = 'btn btn-back';
                switch (this.currentOperation.OperationStatus){
                    case 'success': {
                        classes += ' btn-back__success';
                        break;
                    }
                    case 'notselected': {
                        classes += ' btn-back__notselected';
                        break;
                    }
                    case 'failed': {
                        classes += ' btn-back__failed';
                        break;
                    }
                }
                return classes;
            },
            getReadonly() {
                return this.currentOperation.OperationStatus != 'notselected';
            },
            getTextareaClass() {
                var myclass = 'check__textarea ';

                switch (this.currentOperation.OperationStatus){
                    case 'success': {
                        myclass += 'check__textarea-green';
                        break;
                    }
                    case 'failed': {
                        myclass += 'check__textarea-red';
                        break;
                    }
                    default: {
                        myclass += 'check__textarea-blue';
                    }
                }

                return myclass;
            }
        },
        methods: {
            setOperationIndex(index) {
                this.$emit('set-operation-index', index);
            },
            applyParameters(indexes, id) {
                this.$emit('apply-parameters', indexes, id);
            },
            applyOperation(index, text, newstatus) {
                this.$emit('apply-operation', index, text, newstatus);
            },
            startSmsCountdown(index) {
                this.$emit('start-sms-countdown', index);
            },
            checkCode(index) {
                this.$emit('check-code', index);
            }
        }
    }
</script>