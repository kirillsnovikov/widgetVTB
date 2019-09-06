<template>
  <div class="widget-container">
    <div class="widget-header">
        <Header
            :ClientName="operationsData.ClientName"
            :processStatus="getProcessStatusText"
            :expanded="expanded"
            @collapse-expand-widget="expanded = !expanded"
        />
    </div>
    <transition name="show-widget">
        <div class="widget-main" v-if="expanded">
            <OperationLevel
            :operations="getCurrentOperations"
            :currentOperationIndex="operationsData.SelectedOperationIndex"
            :currentOperation="getCurrentOperation"
            :parameters="getParameters"
            :parentOperationIndex="getParentOperationIndex"
            :fraudStatus="this.operationsData.FraudStatus"
            @set-operation-index="setOperationIndex"
            @apply-parameters="applyParameters"
            @apply-operation="applyOperation"
            @start-sms-countdown="startSmsCountdown"
            @check-code="checkCode"
            @set-fraud-status="setFraudStatus"
            @send-fraud-mail="sendFraudMail"
            />
        </div>
    </transition>
  </div>
</template>

<script>
import outputData from "./data/output_formated";
import Header from "./components/Header.vue";
import OperationLevel from "./components/OperationLevel.vue";
import { Promise } from "q";
import { setTimeout } from "timers";

export default {
    name: "app",
    components: {
        Header,
        OperationLevel
    },
    data() {
        return {
            operationsData: outputData,
            expanded: true
        };
    },
    computed: {
        getProcessStatusText() {
            return this.operationsData.ProcessStatuses.find(st => st.Priority == this.operationsData.ShowingStatusPriority)
        },
        getCurrentOperations() {
            let result = this.operationsData.Operations.filter(operation => {
                return (operation.ParentOperationIndex === this.operationsData.SelectedOperationIndex);
            });
            return result;
        },
        getCurrentOperation() {
            let result;

            if (this.operationsData.SelectedOperationIndex !== null) {
                result = this.operationsData.Operations[this.operationsData.SelectedOperationIndex];
            }
            else {
                result = {};
            }

            return result;
        },
        getParentOperationIndex() {
            let parentOperation = this.operationsData.Operations.find(operation => {
                return operation.Index === this.operationsData.SelectedOperationIndex;
            });

            if (parentOperation) {
                return parentOperation.ParentOperationIndex;
            }
            else {
                return null;
            }
        },
        getParameters() {
            if (Object.keys(this.getCurrentOperation).length !== 0) {
                return this.getCurrentOperation.ParametersIndexes.map(parameterIndex => {
                    return this.operationsData.Parameters[parameterIndex];
                });
            }
        }
    },
    methods: {
        setOperationIndex(index) {
            this.operationsData.SelectedOperationIndex = index;
        },
        applyParameters(indexes, id) {
            var stopperFound = false;

            function lockThisParameters(ths) {
                for (var i in indexes) {
                    if (ths.operationsData.Parameters[i].ParameterStatus != "notselected") {
                        ths.operationsData.Parameters[i].Editable = false;
                    }
                }
            }

            //ищем хотя бы одну проваленую операцию
            for (let i of indexes) {
                if (this.operationsData.Parameters[i].ParameterStatus == "failed") {
                    stopperFound = true;
                    break;
                }
            }

            //если найдена проваленая операция, лочим все выбранные
            if (stopperFound) {
                lockThisParameters(this);
                this.operationsData.Operations[id].OperationStatus = "failed";
            }
            else {
                for (let i in indexes) {
                    if (this.operationsData.Parameters[i].ParameterStatus =="notselected" && this.operationsData.Parameters[i].Required) {
                        stopperFound = true;
                        break;
                    }
                }

                //если найден хотя бы один незаполненный обязательный параметр
                if (stopperFound) {
                    console.log("Надо бы показать пользаку, что он невнимательный");
                }
                else {
                    lockThisParameters(this);
                    this.operationsData.Operations[id].OperationStatus = "success";
                    this.setNewProcessStatus(this, id)
                    // if (this.operationsData.Operations[id].ProcessStatusPriority != null) {
                    //     if (this.operationsData.ShowingStatusPriority) {
                    //         if (this.operationsData.Operations[id].ProcessStatusPriority < this.operationsData.ShowingStatusPriority)
                    //             this.operationsData.ShowingStatusPriority = this.operationsData.Operations[id].ProcessStatusPriority;
                    //     }
                    //     else
                    //         this.operationsData.ShowingStatusPriority = this.operationsData.Operations[id].ProcessStatusPriority;
                    // }
                }
            }
        },
        applyOperation(index, text, newstatus) {
            this.operationsData.Operations[index].CommentText = text;
            this.operationsData.Operations[index].OperationStatus = newstatus;

            if (newstatus == 'success')
                this.setNewProcessStatus(this, index)
        },
        startSmsCountdown(index) {
            function stopCountdown(ths) {
                clearInterval(ths.operationsData.Operations[index].Interval);
                ths.operationsData.Operations[index].Interval = null;
                ths.operationsData.Operations[index].Seconds = 15;
            }

            function callWorkflow() {
                return new Promise(resolve => {
                    //
                    ////
                    setTimeout(() => {
                        resolve(true);
                    }, 4000);
                    ////
                    //
                });
            }

            async function awaitWorkflow() {
                const bool = await callWorkflow();
                return {
                    code: bool ? "00" : "01",
                    text: "tttttt"
                };
            }

            this.operationsData.Operations[index].Interval = setInterval(() => {
                if (this.operationsData.Operations[index].Seconds == 0) {
                    stopCountdown(this);
                }
                else {
                    this.operationsData.Operations[index].Seconds -= 1;
                }
            }, 1000);

            awaitWorkflow().then(result => {
                console.log(123)
                if (result.code == '00') {
                    this.operationsData.Operations[index].CodeSent = true;
                }
            });
        },
        checkCode(index) {
            console.log('code')
            this.operationsData.Operations[index].CodeCheckInProgress = true;

            function callWorkflow() {
                return new Promise(resolve => {
                    //
                    ////
                    setTimeout(() => {
                        resolve(true);
                    }, 4000);
                    ////
                    //
                });
            }

            async function awaitWorkflow() {
                const bool = await callWorkflow();
                return {
                    code: bool ? "00" : "01",
                    text: "tttttt"
                };
            }

            awaitWorkflow().then(result => {
                this.operationsData.Operations[index].CodeCheckInProgress = false;
                if (result.code == '00') {
                    this.operationsData.Operations[index].OperationStatus = 'success';

                    this.setNewProcessStatus(this, index)
                }
            })
        },
        setFraudStatus(newStatus){
            this.operationsData.FraudStatus = newStatus;
        },
        sendFraudMail(requestText, suspicionText, blockedText) {
            this.operationsData.FraudStatus = 'sending';

            function callWorkflow() {
                return new Promise(resolve => {
                    //
                    ////
                    setTimeout(() => {
                        resolve(true);
                    }, 4000);
                    ////
                    //
                });
            }

            async function awaitWorkflow() {
                const bool = await callWorkflow();
                return {
                    code: bool ? "00" : "01",
                    text: "tttttt"
                };
            }

            awaitWorkflow().then(result => {
                if (result.code == '00') {
                    this.operationsData.FraudStatus = 'ok';
                }
            });
        },
        setNewProcessStatus(ths, id) {
            console.log('old: ' + ths.operationsData.ShowingStatusPriority);
            console.log('new: ' + ths.operationsData.Operations[id].ProcessStatusPriority);
            console.log('new < old : ' + ths.operationsData.Operations[id].ProcessStatusPriority < ths.operationsData.ShowingStatusPriority);
            if (ths.operationsData.Operations[id].ProcessStatusPriority != null) {
                if (ths.operationsData.ShowingStatusPriority) {
                    if (ths.operationsData.Operations[id].ProcessStatusPriority < ths.operationsData.ShowingStatusPriority)
                        ths.operationsData.ShowingStatusPriority = ths.operationsData.Operations[id].ProcessStatusPriority;
                }
                else
                    ths.operationsData.ShowingStatusPriority = ths.operationsData.Operations[id].ProcessStatusPriority;
            }
        }
    }
};
</script>
