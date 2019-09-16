<template>
  <div v-if="operationsData" id="authWidget_Block" class="widget-container">
    <div class="widget-header">
        <Header
            :ClientName="operationsData.ClientName"
            :notificationNumberFlg="operationsData.notificationNumberFlg"
            :processStatus="getProcessStatusText"
            :expanded="expanded"
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
            expanded: true,
            X_Offset: null,
            Y_Offset: null,
            mouseOverButton: false,
            mouseIsHolding: false
        };
    },
    watch: {
        operationsData: function(oldV, newV) {
            this.stompClient.send('/v1/auth/put/' + this.sid + '/' + this.operatorSessionId, {}, JSON.stringify(this.operationsData));
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
                    //
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

            function callWorkflow(ths) {
                return new Promise(resolve => {
                    //
                    ////
                    // setTimeout(() => {
                    //     resolve(true);
                    // }, 4000);
                    ////
                    //
                    resolve (SiebelAppFacade.VTB24ProcessHelper.startService(
                        'Workflow Process Manager',
                        'RunProcess',
                        {
                            'ProcessName': 'VTB24 Client Authentification Send Check Code',
                            'actionId': ths.operationsData.actionId,
                            'type': 'sendhCode'
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
        },
        checkCode(index, code) {
            this.operationsData.Operations[index].CodeCheckInProgress = true;

            function callWorkflow(ths) {
                return new Promise(resolve => {
                    //
                    ////
                    // setTimeout(() => {
                    //     resolve(true);
                    // }, 4000);
                    ////
                    //
                    resolve (SiebelAppFacade.VTB24ProcessHelper.startService(
                        'Workflow Process Manager',
                        'RunProcess',
                        {
                            'ProcessName': 'VTB24 Client Authentification Send Check Code',
                            'actionId': ths.operationsData.actionId,
                            'type': 'chechCode',
                            'code': code
                        }
                    ))
                });
            }

            async function awaitWorkflow(ths) {
                return await callWorkflow(ths);
            }

            awaitWorkflow(this).then(result => {
                this.operationsData.Operations[index].CodeCheckInProgress = false;
                if (result['Error Code'] == '00') {
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
                    // setTimeout(() => {
                    //     resolve(true);
                    // }, 4000);
                    ////
                    //
                    resolve (SiebelAppFacade.VTB24ProcessHelper.startService(
                        'Workflow Process Manager',
                        'RunProcess',
                        {
                            'ProcessName': 'VTB24 Send Fraud Suspicion Email to Security',
                            'ActionId': auth_widget_ActionId, // ид действия звонка, но если нужно можем взять и из GetProfileAttr("VTB24 Current Action Id") 
                            'BanProduct': blockedText, // блокировался ли продукт
                            'ReasonSuspicion': suspicionText,  // что вызвало подозрения
                            'TreatmentEssence': requestText // суть обращения
                        }
                    ))
                });
            }

            async function awaitWorkflow() {
                return await callWorkflow();
            }

            awaitWorkflow().then(result => {
                if (result['Error Code'] == '00') {
                    this.operationsData.FraudStatus = 'ok';
                }
            });
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
        }
    },
    mounted() {
        document.body.addEventListener('mouseup', () => {
            if (this.mouseIsHolding) {
                this.mouseIsHolding = false;
                this.X_Offset = null;
                this.Y_Offset = null;
            }
        });

        document.body.addEventListener('mousemove', (e) => {
            if (this.mouseIsHolding) {
                e.preventDefault();
                let widget = $('#authWidget_Block');
                let newX = e.clientX - this.X_Offset;
                let newY = e.clientY - this.Y_Offset - $(document).scrollTop();
                let widgetMargin = 10;

                if (newX < widgetMargin) newX = widgetMargin;
                if (newX > $(window).width() - widgetMargin - widget.width()) newX = null;
                if (newY < widgetMargin) newY = widgetMargin;
                if (newY > $(window).height() - widgetMargin - widget.height()) newY = null;

                if (newX != null) widget.css({
                        right: '',
                        left: newX
                    });
                else widget.css({
                        right: 10,
                        left: ''
                    });

                if (newY != null) {
                    if (newY + widget.outerHeight(includeMargin) / 2 > window.innerHeight / 2)
                        widget.css({
                            bottom: window.innerHeight - newY - widget.outerHeight(includeMargin) - widgetMargin,
                            top: ''
                        })
                    else widget.css({
                        bottom: '',
                        top: newY
                    })
                }
                else widget.css({
                        bottom: widgetMargin,
                        top: newY
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
            applicationName: null
        }

        function callWorkflow() {
            return new Promise(resolve => {
                let res = SiebelAppFacade.VTB24ProcessHelper.startService(
                    'Workflow Process Manager',
                    'RunProcess',
                    {
                        'ProcessName': 'VTB24 Get Auth Administration',
                        'Object Id': ''
                    }
                )
                resolve (res)
            });
        }

        async function awaitWorkflow() {
            return await callWorkflow();
        }

        let self = this;
        awaitWorkflow().then(function (Outp) {
            if (Outp['Error Code'] == '') {
                //получаем массив операций
                var OpsArr = Outp.SM["ListOfVTB24 Auth Administration"]["VTB24 Auth Administration - Operation Groups"];

                //обрабатываем каждую операцию
                for (var op of OpsArr) {
                    //создаём новую операцию
                    var NewOp = {
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
                        var CurrParInd = OpsParsStates.Parameters.map(function (el) {
                            return el.ParameterName;
                        }).indexOf(aap['Parameter Name']);

                        //если такого параметра ещё нет, то создаём его
                        if (CurrParInd == -1) {
                            //создаём новый параметр
                            var NewPar = {
                                Index: OpsParsStates.Parameters.length,
                                ParameterName: aap['Parameter Name'],
                                //success, notselected, failed
                                ParameterStatus: 'notselected',
                                Editable: true
                            };

                            //флаг доверенного номера
                            NewPar.AvalibleWithTrustedNumber = aap['Trusted Number Flg'] == 'Y';

                            //флаг недоверенного номера
                            NewPar.AvalibleWithUntrustedNumber = aap['Untrusted Number Flg'] == 'Y';

                            //флаг "не обязательно"
                            NewPar.Required = aap['Optional Flg'] != 'Y';

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
                    if (typeof laap["VTB24 Auth Administration - Parameters"] == 'undefined') {
                        if (Object.keys(laap).length != 0) processParameter(laap);
                    }
                    else {
                        for (var aap of laap["VTB24 Auth Administration - Parameters"])
                            processParameter(aap);
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

                //создаём сокет, стомп клиент и вытягиваем Id сессии
                var socket = new sockjs(SiebelAppFacade.VTB24ProcessHelper.lookupValue('VTB_BIOMETRICS_CONFIG', 'BiometryWidgetBackendURL'));
                self.stompClient = Stomp.over(socket);
                self.operatorSessionId = SiebelApp.S_App.GetProfileAttr('VTB24SessionId');

                //подключаемся
                self.stompClient.connect({}, function(frame) {
                    console.log('Call session connected (Client Authentication): ' + frame);

                    //подписываемся на ошибки аутентификации в рамках сессии в зибеле
                    self.stompClient.subscribe('/topic/auth/error/' + self.operatorSessionId, function(errorOutput) {
                        console.log('Call session error', errorOutput);
                    })

                    //подписываемся на получение actionId/sid
                    self.stompClient.subscribe('/topic/embp_biometrics/sid/' + self.operatorSessionId, function(sidOutput) {
                        self.sid = sidOutput.body;
                        console.log('ActionId (Client Authentication): ' + self.sid);

                        //подписываюсь на окончание зваонка
                        self.stompClient.subscribe('/topic/auth/close/' + self.sid + '/' + operatorSessionId, function(closeOutput){
                            console.log('Call session close', closeOutput);
                            self.operationsData = null;
                        })

                        //подписываюсь на получение Snapshot
                        self.stompClient.subscribe('/topic/auth/' + self.sid + '/' + self.operatorSessionId, function(snapshotOutput) {
                            console.log('Snapshot', snapshotOutput);

                            if (snapshotOutput.body == 'NEW_SESSION') {
                                //запрашиваю информацию о звонке
                                self.stompClient.send('/v1/auth/sessionInfo/' + self.sid + '/' + operatorSessionId)
                            }
                            else
                                self.operationsData = JSON.parse(snapshotOutput.body);
                        }, self.stompHeader_Snapshot)

                        //подписываюсь на получение информации о звонке
                        self.stompClient.subscribe('/topic/auth/sessionInfo/' + self.sid + '/' + operatorSessionId, function(infoOutput){
                            let CallInfo = JSON.parse(infoOutput.body);

                            self.operationsData = Object.assign({}, self.defaultDataTemplate);

                            function callWorkflow(id) {
                                return new Promise(resolve => {
                                    let res = SiebelAppFacade.VTB24ProcessHelper.startService(
                                        'Workflow Process Manager',
                                        'RunProcess',
                                        {
                                            'ProcessName': 'VTB Auth Customer Info Process',
                                            'Object Id': id
                                        }
                                    )
                                    resolve (res)
                                });
                            }

                            async function awaitWorkflow(id) {
                                return await callWorkflow(id);
                            }

                            awaitWorkflow(CallInfo.customerId).then(Output => {
                                if (Output['Error Code'] == '') {
                                    self.operationsData.clientName = Output['First Name'] + ' ' + Output['Last Name'];
                                    self.operationsData.notificationNumberFlg = CallInfo.notificationNumberFlg;
                                    self.applicationName = SiebelApp.S_App.GetAppName();
                                }
                                else console.log(Output['Error Code'] + ': ' + Output['Error Text'])
                            })

                        })

                        self.stompClient.send('/v1/auth/get/' + self.sid + '/' + self.operatorSessionId)
                    })
                })
                //-------------------------------------
            }
            else {
                console.log('%c' + Outp['Error Code'] + ': ' + Outp['Error Message'], 'color: #a00');
            }
        })
    }
};
</script>
