(function() {
    'use strict';
    angular.module('sejaDiretoApp').service('HorariosService', Service);

    function Service(ConfigService) {
        var service = {};
        service.getTempoMaximoAgendamento = getTempoMaximoAgendamento;
        service.getProximoHorarioUtil = getProximoHorarioUtil;
        service.listarDatas = listarDatas;
        service.listarHoras = listarHoras;
        return service;

        function getTempoMaximoAgendamento(currentStep, currentTime, maxTime) {
            if (!currentTime) {
                var currentTime = new Date();
            }
            if (isNaN(maxTime)) {
                var maxTime = (currentStep.tempoMaximoAgendamento) * 60000;
            }
            var nexUsefullTime = getProximoHorarioUtil(currentTime);
            var timeDiffEndOfDay = getTimeDiffEndOfDay(nexUsefullTime);
            if (timeDiffEndOfDay > maxTime) {
                return new Date(nexUsefullTime.getTime() + maxTime);
            } else {
                maxTime -= timeDiffEndOfDay;
                var addADay = 25 * 60 * 60 * 1000; // 25hrs em ms
                var nextDay = gateDateObject(currentTime.getTime() + addADay);
                return getTempoMaximoAgendamento(currentStep, nextDay, maxTime);
            }
        }

        function gateDateObject(currentTime, time) {
            var date = new Date(currentTime);
            if (time) {
                var nDate = moment.utc(time);
                date.setHours(nDate.hours(), nDate.minutes(), 0, 0);
            } else {
                date.setHours(0, 1, 0, 0);
            }
            return date;
        }

        function getTimeDiffEndOfDay(currentTime) {
            var dayOfWeek = currentTime.getDay();
            var work_time = ConfigService.horario[dayOfWeek];
            var end = gateDateObject(currentTime.getTime(), new Date(work_time.fim));
            return end.getTime() - currentTime.getTime();
        }

        function getProximoHorarioUtil(currentTime) {
            if (!currentTime) {
                currentTime = new Date();
            }
            var dayOfWeek = currentTime.getDay();
            var work_time = ConfigService.horario[dayOfWeek];
            if (work_time.active) {
                var start = gateDateObject(currentTime.getTime(), work_time.inicio);
                var end = gateDateObject(currentTime.getTime(), work_time.fim);
            }
            if (work_time.active && currentTime.getTime() >= start.getTime() && currentTime.getTime() <= end.getTime()) {
                return currentTime;
            } else if (work_time.active && currentTime.getTime() < start.getTime()) {
                return start;
            } else {
                var addADay = 25 * 60 * 60 * 1000; // 25hrs em ms
                var nextDay = gateDateObject(currentTime.getTime() + addADay);
                return getProximoHorarioUtil(nextDay);
            }
        }

        function listarDatas(minTime, maxTime) {
            var dates = [];
            var inicio = moment(minTime).locale('pt-br');
            var fim = moment(maxTime).locale('pt-br');
            var work_time = false;
            var selected = inicio.format('L');
            while (inicio.isSameOrBefore(fim, 'day')) {
                work_time = ConfigService.horario[inicio.day()];
                if (work_time.active) {
                    dates.push({
                        value: inicio.format('L'),
                        text: inicio.format('L') + ' (' + inicio.format('dddd') + ')'
                    });
                }
                inicio.add(1, 'day');
            }
            return dates;
        }

        function listarHoras(date, maxTime) {
            var hours = [];
            var dateObj = moment(date, 'DD/MM/YYYY');
            dateObj.locale('pt-br');
            var dayOfWeek = dateObj.day();
            var work_time = ConfigService.horario[dayOfWeek];
            if (work_time.active) {
                var endOfDay = moment(date, 'DD/MM/YYYY').locale('pt-br');
                var startOfDay = moment(date, 'DD/MM/YYYY').locale('pt-br');
                var endTimeObj = moment.utc(work_time.fim);
                endOfDay.hours(endTimeObj.hours());
                endOfDay.minutes(endTimeObj.minutes());
                var startTimeObj = moment.utc(work_time.inicio);
                startOfDay.hours(startTimeObj.hours());
                startOfDay.minutes(startTimeObj.minutes());
                if (dateObj.isSame(moment(), 'day') && moment().isAfter(startOfDay)) {
                    dateObj = moment().locale('pt-br');
                    if (dateObj.minutes() > 30) {
                        dateObj.minutes(30);
                    } else {
                        dateObj.minutes(0);
                    }
                    dateObj.add(30, 'minutes');
                    dateObj.seconds(0).milliseconds(0);
                } else {
                    dateObj = startOfDay;
                }
                if (dateObj.isSame(maxTime, 'day')) {
                    while (dateObj.isSameOrBefore(maxTime)) {
                        var utcdate = moment(dateObj).utc();
                        hours.push({
                            value: utcdate.format(),
                            text: dateObj.format('LT')
                        });
                        dateObj.add(30, 'minutes');
                    }
                } else {
                    while (dateObj.isSameOrBefore(endOfDay)) {
                        var utcdate = moment(dateObj).utc();
                        hours.push({
                            value: utcdate.format(),
                            text: dateObj.format('LT')
                        });
                        dateObj.add(30, 'minutes');
                    }
                }
            } else {
                hours = [{
                    value: null,
                    text: 'Fora do horário de funcionamento'
                }];
            }
            return hours;
        }
    }
})();