<template>
  <div v-if="operationsData" id="authWidget_Block" class="widget-container">
    <div class="widget-header">
        <Header
            :clientName="operationsData.clientName"
            :notificationNumberFlg="operationsData.notificationNumberFlg"
            :processStatus="getProcessStatusText"
            :expanded="expanded"
            @add-header-eventlisteners="addHeaderEventlisteners"
            @collapse-expand-widget="expanded = !expanded"
            @mouseDownHeader="mouseDownHeader"
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
                :fraudStatus="operationsData.FraudStatus"
                :appName="operationsData.applicationName"
                @set-operation-index="setOperationIndex"
                @apply-parameters="applyParameters"
                @apply-operation="applyOperation"
                @start-sms-countdown="startSmsCountdown"
                @check-code="checkCode"
                @set-fraud-status="setFraudStatus"
                @send-fraud-mail="sendFraudMail"
                @mouse-down-header="mouseDownHeader"
                @mouse-enter-button="mouseEnterButton"
                @mouse-leave-button="mouseLeaveButton"
            />
        </div>
    </transition>
  </div>
</template>

<script>
//import outputData from "./data/output_formated";
//import outputData from './data/output.json';
import Header from "./components/Header.vue";
import OperationLevel from "./components/OperationLevel.vue";
import { Promise } from "q";
import { setTimeout } from "timers";
import Stomp from 'stompjs';
import sockjs from 'sockjs-client';
import $ from 'jquery';

export default {
    name: "app",
    components: {
        Header,
        OperationLevel
    },
    data() {
        return {
            defaultDataTemplate: null,
            operatorSessionId: null,
            sid: null,
            stompClient: null,
            stompHeader_Snapshot: null,
            operationsData: null,
            expanded: false,
            X_Offset: null,
            Y_Offset: null,
            mouseOverButton: false,
            mouseIsHolding: false
        };
    },
    watch: {
        operationsData: function(oldVal, newVal) {
            this.stompClient.send('/v1/auth/put/' + this.sid + '/' + this.operatorSessionId, {}, JSON.stringify(newVal));
        }
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
        mouseDownHeader(e) {
            if (!this.data.mouseOverButton) {
                this.data.mouseIsHolding = true;

                let authWidget_Block = document.getElementById('authWidget_Block');

                this.data.X_Offset = e.clientX - authWidget_Block.offset().left;
                this.data.Y_Offset = e.clientY - authWidget_Block.offset().top;
            }
        },
        mouseEnterButton() {
            this.mouseOverButton = true;
        },
        mouseLeaveButton() {
            this.mouseOverButton = false;
        },
        setOperationIndex(index) {
            this.operationsData.SelectedOperationIndex = index;
        },
        applyParameters(indexes, id) {
            var stopperFound = false;

            function lockThisParameters(ths) {
                for (var i of indexes) {
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
                this.operationsData.Operations[id].isWarningDisplaying = false;
                lockThisParameters(this);
                this.operationsData.Operations[id].OperationStatus = "failed";
            }
            else {
                for (let i of indexes) {
                    if (this.operationsData.Parameters[i].ParameterStatus == "notselected" && this.operationsData.Parameters[i].Required) {
                        console.log('this.operationsData.Parameters[i]', this.operationsData.Parameters[i])
                        console.log('this.operationsData.Parameters[i].ParameterStatus', this.operationsData.Parameters[i].ParameterStatus)
                        console.log('this.operationsData.Parameters[i].ParameterStatus == "notselected"', this.operationsData.Parameters[i].ParameterStatus == "notselected")
                        console.log('this.operationsData.Parameters[i].Required', this.operationsData.Parameters[i].Required)
                        console.log('itogo', this.operationsData.Parameters[i].ParameterStatus == "notselected" && this.operationsData.Parameters[i].Required)
                        stopperFound = true;
                        break;
                    }
                }

                //если найден хотя бы один незаполненный обязательный параметр
                if (stopperFound) {
                    this.operationsData.Operations[id].isWarningDisplaying = true;
                }
                else {
                    this.operationsData.Operations[id].isWarningDisplaying = false;
                    lockThisParameters(this);
                    this.operationsData.Operations[id].OperationStatus = "success";
                    this.setNewProcessStatus(this, id)
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

            //для локальной разработки закомментируй отсюда

            function callWorkflow(ths) {
                return new Promise(resolve => {
                    resolve (SiebelAppFacade.VTB24ProcessHelper.startService(
                        'Workflow Process Manager',
                        'RunProcess',
                        {
                            'ProcessName': 'VTB24 Client Authentification Send Check Code',
                            'actionId': ths.operationsData.actionId,
                            'type': 'sendCode'
                        }
                    ))
                });
            }

            async function awaitWorkflow(ths) {
                return await callWorkflow(ths);
            }

            this.operationsData.Operations[index].Interval = setInterval(() => {
                if (this.operationsData.Operations[index].Seconds == 0) {
                    stopCountdown(this);
                }
                else {
                    this.operationsData.Operations[index].Seconds -= 1;
                }
            }, 1000);

            awaitWorkflow(this).then(result => {
                if (result['Error Code'] == '00') {
                    this.operationsData.Operations[index].CodeSent = true;
                }
            });
            //вот до сюда
        },
        checkCode(index, code) {
            this.operationsData.Operations[index].CodeCheckInProgress = true;

            //для локальной разработки закомментируй от сюда

            // function callWorkflow(ths) {
            //     return new Promise(resolve => {
            //         resolve (SiebelAppFacade.VTB24ProcessHelper.startService(
            //             'Workflow Process Manager',
            //             'RunProcess',
            //             {
            //                 'ProcessName': 'VTB24 Client Authentification Send Check Code',
            //                 'actionID': ths.operationsData.actionId,
            //                 'type': 'checkCode',
            //                 'code': code
            //             }
            //         ))
            //     });
            // }

            // async function awaitWorkflow(ths) {
            //     return await callWorkflow(ths);
            // }

            // awaitWorkflow(this).then(result => {
            //     this.operationsData.Operations[index].CodeCheckInProgress = false;
            //     if (result['Error Code'] == '00') {
            //         this.operationsData.Operations[index].OperationStatus = 'success';

            //         this.setNewProcessStatus(this, index)
            //     }
            // })
            //до сюда
        },
        setFraudStatus(newStatus){
            this.operationsData.FraudStatus = newStatus;
        },
        sendFraudMail(requestText, suspicionText, blockedText) {
            this.operationsData.FraudStatus = 'sending';

            //для локальной разработки закомментируй отсюда

            // function callWorkflow() {
            //     return new Promise(resolve => {
            //         resolve (SiebelAppFacade.VTB24ProcessHelper.startService(
            //             'Workflow Process Manager',
            //             'RunProcess',
            //             {
            //                 'ProcessName': 'VTB24 Send Fraud Suspicion Email to Security',
            //                 'ActionId': auth_widget_ActionId, // ид действия звонка, но если нужно можем взять и из GetProfileAttr("VTB24 Current Action Id") 
            //                 'BanProduct': blockedText, // блокировался ли продукт
            //                 'ReasonSuspicion': suspicionText,  // что вызвало подозрения
            //                 'TreatmentEssence': requestText // суть обращения
            //             }
            //         ))
            //     });
            // }

            // async function awaitWorkflow() {
            //     return await callWorkflow();
            // }

            // awaitWorkflow().then(result => {
            //     if (result['Error Code'] == '00') {
            //         this.operationsData.FraudStatus = 'ok';
            //     }
            // });
            //до сюда
        },
        setNewProcessStatus(ths, id) {
            if (ths.operationsData.Operations[id].ProcessStatusPriority != null) {
                if (ths.operationsData.ShowingStatusPriority) {
                    if (ths.operationsData.Operations[id].ProcessStatusPriority < ths.operationsData.ShowingStatusPriority)
                        ths.operationsData.ShowingStatusPriority = ths.operationsData.Operations[id].ProcessStatusPriority;
                }
                else
                    ths.operationsData.ShowingStatusPriority = ths.operationsData.Operations[id].ProcessStatusPriority;
            }
        },
        addHeaderEventlisteners() {
            document.getElementById('auth_widget_Header').addEventListener('mousedown', (e) => {
                if (!this.mouseOverButton) {
                    this.mouseIsHolding = true;

                    let widget = $('#authWidget_Block');
                    this.X_Offset = e.clientX - widget.offset().left;
                    this.Y_Offset = e.clientY - widget.offset().top;
                }
            })

            let btn = document.getElementById('auth_widget_HeaderButton');
            btn.addEventListener('mouseenter', () => {
                this.mouseOverButton = true;
            })

            btn.addEventListener('mouseleave', () => {
                this.mouseOverButton = false;
            })
        }
    },
    mounted() {

        document.body.addEventListener('mouseup', () => {
            if (this.mouseIsHolding) {
                this.mouseIsHolding = false;
                this.X_Offset = null;
                this.Y_Offset = null;

                let style = document.getElementById('authWidget_Block').style;
                let newstr ='auth_widget_position=' + style.top + ',' + style.right + ',' + style.bottom + ',' + style.left;
                document.cookie = newstr;
            }
        });

        document.body.addEventListener('mousemove', (e) => {
            if (this.mouseIsHolding) {
                e.preventDefault();
                let widget = $('#authWidget_Block');
                let newX = e.clientX - this.X_Offset;
                let newY = e.clientY - this.Y_Offset - $(document).scrollTop();
                let widgetMargin = 10;

                //высчитваю новый X
                if (newX < widgetMargin)
                    widget.css({
                        right: '',
                        left: widgetMargin
                    })
                else if (newX > $(window).width() - widgetMargin * 3 - widget.width())widget.css({
                        right: widgetMargin,
                        left: ''
                    })
                else
                    widget.css({
                        right: '',
                        left: newX
                    });

                //высчитываю новый Y
                if (newY < widgetMargin)
                    widget.css({
                        top: widgetMargin,
                        bottom: ''
                    })
                else if (newY > $(window).height() - widgetMargin - widget.height() - widgetMargin * 2)
                    widget.css({
                        top: '',
                        bottom: widgetMargin
                    })
                else if (newY + widget.outerHeight() / 2 > $(window).height() / 2 - widgetMargin * 2)
                    widget.css({
                        top: '',
                        bottom: $(window).height() - newY - widget.outerHeight()
                    })
                else
                    widget.css({
                        top: newY,
                        bottom: ''
                    })
            }
        })

        let OpsParsStates = {
            clientName: '',
            SelectedOperationIndex: null,
            ShowingStatusPriority: null,
                // ok
                // suspicion
                // confirmed
                // sending
                // sent
            FraudStatus: 'ok',
            Operations: [],
            Parameters: [],
            ProcessStatuses: [
                {
                    Priority: 1,
                    Text: 'Установлен запрет на обслуживание клиента. Дата и время снятия запрета: '
                },
                {
                    Priority: 2,
                    Text: 'Аутентификация не проводилась.'
                }
            ],
            notificationNumberFlg: null,
            applicationName: null,
            prohibitedDate: null
        }

        //для локальной разработки закомментируй отсюда

        // function callWorkflow() {
        //     return new Promise(resolve => {
        //         let res = SiebelAppFacade.VTB24ProcessHelper.startService(
        //             'Workflow Process Manager',
        //             'RunProcess',
        //             {
        //                 'ProcessName': 'VTB24 Get Auth Administration',
        //                 'Object Id': ''
        //             }
        //         )
        //         resolve (res)
        //     });
        // }

        // async function awaitWorkflow() {
        //     return await callWorkflow();
        // }

        //до сюда

        let self = this;

        //потом отсюда
        // awaitWorkflow().then(function (Outp) {
        //     if (Outp['Error Code'] == '') {
        //         //получаем массив операций
        //         var OpsArr = Outp.SM["ListOfVTB24 Auth Administration"]["VTB24 Auth Administration - Operation Groups"];
        //до сюда

        /*dev--------------------------------*/ let OpsArr = outputData;

                //обрабатываем каждую операцию
                for (let op of OpsArr) {
                    //создаём новую операцию
                    let NewOp = {
                        Index: OpsParsStates.Operations.length,
                        OperationName: op['Operation Name'],
                        OperationText: op['Display Text'],
                        AvailableInACC: op.ACC == 'Y',
                        AvailableOnServiceProhibited: op['Available w Service Prohibited'] === 'Y',
                        Comment: op['Comment Required Flg'] === 'Y',
                        HintText: op['Hint Text'],
                        ParentOperationIndex: (
                            (op['Parent Operation'] == '')
                                ?
                                null
                                :
                                OpsArr.map(function (el) {
                                    return el['Operation Name'];
                                }).indexOf(op['Parent Operation'])
                        ),
                        //success, notselected, failed
                        OperationStatus: 'notselected',
                        ProcessStatusPriority: null,
                        isWarningDisplaying: false,
                        ParametersIndexes: []
                    };

                    //тип проверки
                    switch (op['Check']){
                        case 'По кнопкам Да/Нет': {
                            NewOp.CheckType = 'YesNo';
                            break;
                        }
                        case 'По кнопке ОК': {
                            NewOp.CheckType = 'OkButton';
                            break;
                        }
                        case 'SMS': {
                            NewOp.CheckType = 'Sms';
                            NewOp.Seconds = 15;
                            NewOp.Timeout = null;
                            NewOp.Interval = null;
                            NewOp.CodeSent = false;
                            NewOp.CodeCheckInProgress = false;
                            break;
                        }
                        default: {
                            NewOp.CheckType = null;
                            break;
                        }
                    }

                    //функция обработки параметра
                    function processParameter(aap) {
                        //получаем индекс такой же операции в массиве операций в слепке состояния
                        let CurrParInd = OpsParsStates.Parameters.map(function (el) {
                            return el.ParameterName;
                        }).indexOf(aap['Parameter Name']);

                        //если такого параметра ещё нет, то создаём его
                        if (CurrParInd == -1) {
                            //создаём новый параметр
                            var NewPar = {
                                Index: OpsParsStates.Parameters.length,
                                ParameterName: aap['Parameter Name'],
                                AvalibleWithTrustedNumber: aap['Trusted Number Flg'] == 'Y',
                                AvalibleWithUntrustedNumber: aap['Untrusted Number Flg'] == 'Y',
                                Required: aap['Optional Flg'] != 'Y',
                                //success, notselected, failed
                                ParameterStatus: 'notselected',
                                Editable: true
                            };

                            //записываем новый параметр в массив параметров
                            OpsParsStates.Parameters.push(NewPar);

                            //записываем индекс нового параметра в массив параметров новой операции
                            NewOp.ParametersIndexes.push(OpsParsStates.Parameters.length - 1)
                        } else {
                            //записываем индекс имеющегося параметра в массив параметров новой операции
                            NewOp.ParametersIndexes.push(CurrParInd);
                        }
                    }

                    //обрабатываем список параметров
                    var laap = op['ListOfVTB24 Auth Administration - Parameters'];
                    if (typeof laap["VTB24 Auth Administration - Parameters"] == 'undefined'
                        ||
                        typeof laap["VTB24 Auth Administration - Parameters"][0] == 'undefined') {
                        if (Object.keys(laap).length != 0) {
                            processParameter(laap["VTB24 Auth Administration - Parameters"]);
                        }
                    }
                    else {
                        for (var aap of laap["VTB24 Auth Administration - Parameters"]) {
                            processParameter(aap);
                        }
                    }

                    //добавляю новую операцию в массив операций объекта слепка
                    OpsParsStates.Operations.push(NewOp);
                } //конец for (var op of OpsArr)

                OpsParsStates.ProcessStatuses.push({
                    Priority: 3,
                    Text: 'Аутентификация пройдена по части рисковых операций. Перед выполнение операции проверьте полноту запрошенных параметров.'
                });

                OpsParsStates.ProcessStatuses.push({
                    Priority: 4,
                    Text: 'Аутентификация пройдена по нерисковым. Выполнение других операций запрещено.'
                });

                OpsParsStates.ProcessStatuses.push({
                    Priority: 5,
                    Text: 'Аутентификация пройдена по блокировке продуктов. Выполнение других операций запрещено.'
                });

                var op = OpsParsStates.Operations.find(operation => operation.OperationName == 'Рисковые операции')
                if (op) op.ProcessStatusPriority = 3;

                op = OpsParsStates.Operations.find(operation => operation.OperationName == 'Нерисковые операции')
                if(op) op.ProcessStatusPriority = 4;

                op = OpsParsStates.Operations.find(operation => operation.OperationName == 'Блокировка продукта')
                if(op) op.ProcessStatusPriority = 5;

                //-------------------------------------
                //-------------------------------------
                //-------------------------------------
                //-------------------------------------
                //-------------------------------------

                self.defaultDataTemplate = Object.assign({}, OpsParsStates);

                /*dev--------------------------------*/self.operationsData = Object.assign({}, self.defaultDataTemplate);
                /*dev--------------------------------*/self.operationsData.clientName = 'Иван Петрович'
                /*dev--------------------------------*/self.operationsData.notificationNumberFlg = true;
                /*dev--------------------------------*/self.applicationName = 'Siebel Universal Agent';

                //и потом отсюда

//                 //создаём сокет, стомп клиент и вытягиваем Id сессии
//                 var socket = new sockjs(SiebelAppFacade.VTB24ProcessHelper.lookupValue('VTB_BIOMETRICS_CONFIG', 'BiometryWidgetBackendURL'));
//                 self.stompClient = Stomp.over(socket);
//                 self.operatorSessionId = SiebelApp.S_App.GetProfileAttr('VTB24SessionId');

//                 //подключаемся
//                 self.stompClient.connect({}, function(frame) {
//                     console.log('Call session connected (Client Authentication): ' + frame);

//                     //подписываемся на ошибки аутентификации в рамках сессии в зибеле
//                     self.stompClient.subscribe('/topic/auth/error/' + self.operatorSessionId, function(errorOutput) {
//                         console.log('Call session error', errorOutput);
//                     })

//                     //подписываемся на получение actionId/sid
//                     self.stompClient.subscribe('/topic/embp_biometrics/sid/' + self.operatorSessionId, function(sidOutput) {
//                         self.sid = sidOutput.body;
//                         console.log('ActionId (Client Authentication): ' + self.sid);

//                         //подписываюсь на окончание зваонка
//                         self.stompClient.subscribe('/topic/auth/close/' + self.sid + '/' + self.operatorSessionId, function(closeOutput){
//                             console.log('Call session close', closeOutput);
//                             self.operationsData = null;
//                             self.sid = null;
//                         })

//                         //подписываюсь на получение Snapshot
//                         self.stompClient.subscribe('/topic/auth/' + self.sid + '/' + self.operatorSessionId, function(snapshotOutput) {
//                             console.log('Snapshot', snapshotOutput);

//                             if (snapshotOutput.body == 'NEW_SESSION') {
//                                 //запрашиваю информацию о звонке
//                                 self.stompClient.send('/v1/auth/sessionInfo/' + self.sid + '/' + self.operatorSessionId)
//                             }
//                             else
//                                 self.operationsData = JSON.parse(snapshotOutput.body);
//                         }, self.stompHeader_Snapshot)

//                         //подписываюсь на получение информации о звонке
//                         self.stompClient.subscribe('/topic/auth/sessionInfo/' + self.sid + '/' + self.operatorSessionId, function(infoOutput){
//                             let CallInfo = JSON.parse(infoOutput.body);

//                             self.operationsData = Object.assign({}, self.defaultDataTemplate);

//                             function callWorkflow(id) {
//                                 return new Promise(resolve => {
//                                     let res = SiebelAppFacade.VTB24ProcessHelper.startService(
//                                         'Workflow Process Manager',
//                                         'RunProcess',
//                                         {
//                                             'ProcessName': 'VTB Auth Customer Info Process',
//                                             'Object Id': id
//                                         }
//                                     )
//                                     resolve (res)
//                                 });
//                             }

//                             async function awaitWorkflow(id) {
//                                 return await callWorkflow(id);
//                             }

//                             awaitWorkflow(CallInfo.customerId).then(Output => {
//                                 if (Output['Error Code'] == '') {
//                                     self.operationsData.clientName = Output['First Name'] + ' ' + Output['Last Name'];

//                                     if(Output['Prohibited'] != '')
//                                         self.operationsData.prohibitedDate = Output['Prohibited Date'];

//                                     self.operationsData.notificationNumberFlg = CallInfo.notificationNumberFlg;
// \
//                                     self.applicationName = SiebelApp.S_App.GetAppName();
//                                 }
//                                 else console.log(Output['Error Code'] + ': ' + Output['Error Text'])
//                             })

//                         })

//                         self.stompClient.send('/v1/auth/get/' + self.sid + '/' + self.operatorSessionId)
//                     })
//                 })
//                 //-------------------------------------
//             }
//             else {
//                 console.log('%c' + Outp['Error Code'] + ': ' + Outp['Error Message'], 'color: #a00');
//             }
//         })

        //до сюда
    }
};
</script>
