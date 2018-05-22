"use strict";
/* VERSION 0.4.0*/

const BURN_YEAR_ZERO = 1985;
const TIME_UNIT = 864; // milliseconds
const UTC_PACIFIC_OFFSET = 7;
const BURN_HOUR_PDT = 22;
const BURN_HOUR_UTC = (BURN_HOUR_PDT + UTC_PACIFIC_OFFSET) % 24;
let currentYearIsPastBurnDay = false;
let timerDisplayElement = {
	DAYS: "days",
	HOURS: "hours",
	MINUTES: "minutes",
	SECONDS: "seconds"
};
let xtianSecondsCount = -1;

//console.log("BlackRockInfinite.js running");

function OnMetricSecondTick() {
	if (xtianSecondsCount >= 0){
		//TODO: This won't work
		xtianSecondsCount = xtianSecondsCount - TIME_UNIT;
	}
	// console.log("xtianSecondsCount = " + xtianSecondsCount);
	let metricSeconds = Math.floor(xtianSecondsCount / TIME_UNIT);
	let metricMinutes = Math.floor(metricSeconds / 100);
	let metricHours = Math.floor(metricMinutes / 100);
	let days = (Math.floor(metricHours / 10)).toString();
	// console.log("rawCalc"+days+":"+metricHours+":"+metricMinutes+":"+metricSeconds);
	metricSeconds = (metricSeconds %= 100).toString();
	metricMinutes = (metricMinutes %= 100).toString();
	metricHours = (metricHours %= 10).toString();
	metricSeconds = AddLeadingZero(metricSeconds, 2);
	metricMinutes = AddLeadingZero(metricMinutes, 2);
	metricHours = AddLeadingZero(metricHours, 2);
	days = AddLeadingZero(days, 3);

	let daysSpan = document.getElementById(timerDisplayElement.DAYS);
	let hoursSpan = document.getElementById(timerDisplayElement.HOURS);
	let minutesSpan = document.getElementById(timerDisplayElement.MINUTES);
	let secondsSpan = document.getElementById(timerDisplayElement.SECONDS);

	daysSpan.innerHTML = days;
	hoursSpan.innerHTML = metricHours;
	minutesSpan.innerHTML = metricMinutes;
	secondsSpan.innerHTML = metricSeconds;

}

function AddLeadingZero(numberString, length) {
	let resultString = numberString;
	//console.log("add leading zero: resultString.length = " + resultString.length + ", length = " + length + ", string = " + resultString);
	while (resultString.length < length) {
		//console.log("Adding leading zero...");
		resultString = "0" + resultString;
	}
	return resultString;
}

function GetNextBurnDay(dateObj) {
	const SEPTEMBER_INDEX = 8;
	// const BURN_DAY_TIME_OFFSET = 2 * (60 * 60 * 24 * 1000);
	let nextBurnDay = dateObj || new Date(); // now
	let initTime = nextBurnDay.getTime();
	let initDate = nextBurnDay.getUTCDate();
	let initMonth = nextBurnDay.getUTCMonth();
	nextBurnDay.setUTCMonth(SEPTEMBER_INDEX);
	nextBurnDay.setUTCHours(BURN_HOUR_UTC);
	nextBurnDay.setUTCMinutes(0);
	nextBurnDay.setUTCSeconds(0);

	if (initMonth > SEPTEMBER_INDEX) {
		nextBurnDay.setUTCFullYear(nextBurnDay.getUTCFullYear() + 1);
		currentYearIsPastBurnDay = true;
	}

	// Set to Labor Day
	SetToFirstMonday(nextBurnDay);
	// Set burn day
	nextBurnDay.setUTCDate(nextBurnDay.getUTCDate() - 2);

	if (initMonth === SEPTEMBER_INDEX && initDate > nextBurnDay.getUTCDate()) {
		// If it's September, find out if Labor Day has passed
		nextBurnDay.setUTCFullYear(nextBurnDay.getUTCFullYear() + 1);
		SetToFirstMonday(nextBurnDay);
		nextBurnDay.setUTCDate(nextBurnDay.getUTCDate() - 2);
		currentYearIsPastBurnDay = true;
	}

	let base1month = nextBurnDay.getMonth() + 1;
	//console.log("Next Burn Day is: " + base1month + "/" + nextBurnDay.getDate() + "/" + nextBurnDay.getFullYear());

	xtianSecondsCount = (nextBurnDay.getTime() - initTime);// / 10;
	return nextBurnDay;
}

function SetToFirstMonday(dateObj) {

	const MONDAY_INDEX = 1; // 2 = UTC TUESDAY
	const MONDAY_OFFSET = 8 + MONDAY_INDEX;
	const DAYS_IN_WEEK = 7;

	dateObj.setUTCDate(1);

	let dayOfWeek = dateObj.getDay();
	let firstMonday = 1;
	if (dayOfWeek !== MONDAY_INDEX) {
		firstMonday = (MONDAY_OFFSET - dayOfWeek) % DAYS_IN_WEEK;
		if (firstMonday === 0) firstMonday = DAYS_IN_WEEK;
		dateObj.setUTCDate(firstMonday);
	}
	//console.log("dateObj.getUTCDate: " + dateObj.getUTCDate());
	let days = ["sunday", "monday", "tues", "wed", "thu", "fri", "sat"];
	//console.log("Date 1 is a " + days[dayOfWeek] + ", first Monday is on the " + firstMonday + " at " + dateObj.getUTCHours() + ":00");
}

/*
9-4-17
9-3-18
9/2/19
9-7-20
9-6-21
9-5-22
9-4-23
9-2-24
9-1-25
*/

function GetBurnYear(fullYear) {
	// TODO: add correction for post-Labor Day
	// count from previous labor day
	return fullYear - BURN_YEAR_ZERO;
}

GetNextBurnDay(new Date());
window.setInterval(OnMetricSecondTick, TIME_UNIT);
