// ICT373 Assignment 1 - Question 1
// Liyana Afiqah Binte Jazmi - 35849414
// User Information Form Validation
import { CONFIG } from './config.js';

function validateName(name) {
    const trimmedName = name.trim();

    // Name should only be letters. May include ' or - and spaces
    const nameRegex = /^[A-Za-z]+(?:['-][A-Za-z]+)*(?: [A-Za-z]+(?:['-][A-Za-z]+)*)*$/;

    if (trimmedName === "")
        return false;

    const checkName = nameRegex.test(trimmedName);

    if (checkName) {
        return true;
    } else {
        return false;
    }
}

function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    const trimmedNumber = phoneNumber.trim();

    const checkNumber = phoneRegex.test(trimmedNumber);

    if (checkNumber) {
        return true;
    } else {
        return false;
    }
}

function validateDateFormat(dob) {
    const dateRegex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
    const checkDate = dateRegex.test(dob);

    if (checkDate) {
        return true;
    } else {
        return false;
    }
}


function extractDateComponents(dob) {

    // Split the string wherever a "/" occurs.
    const parts = dob.split("/");

    // Extract and convert each part into a number.
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);

    return {
        day: day,
        month: month,
        year: year
    };
}

function isLeapYear(year) {

    if (year % 400 === 0) {
        return true;
    }

    if (year % 4 === 0 && year % 100 !== 0) {
        return true;
    }

    return false;
}

function getDaysInMonth(month, year) {
    if (month === 2) {
        if (isLeapYear(year)) {
            return 29;
        } else {
            return 28;
        }
    }

    if (month === 1 || month === 3 || month === 5 ||
        month === 7 || month === 8 || month === 10 || month === 12) {
        return 31;

    } else if (month === 4 || month === 6 ||
        month === 9 || month === 11) {
        return 30;

    } else {
        return 0;
    }
}


function validateBirthDate(dob) {

    // Validate DD/MM/YYYY format
    if (!validateDateFormat(dob)) {
        return false;
    }

    // Extract the date components
    const { day, month, year } = extractDateComponents(dob);

    // Reject invalid years
    if (year <= 0)
        return false;

    // Reject invalid months
    if (month <= 0 || month > 12)
        return false;

    // Get the maximum days for that month
    const maxDays = getDaysInMonth(month, year);

    // Reject invalid days
    if (day > maxDays || day <= 0)
        return false;

    return true;
}


async function getCurrentDate() {

    const response = await fetch(
        'https://api.data.gov.sg/v1/transport/traffic-images',
        {
            headers: {
                'x-api-key': CONFIG.API_KEY
            }
        }
    );

    // Check whether the HTTP request succeeded.
    if (!response.ok) {
        throw new Error("Unable to retrieve current date.");
    }

    // Convert the response into a JavaScript object
    const data = await response.json();

    // Retrieve the timestamp from json response
    const timestamp = data.items[0].timestamp;


    // Split the timestamp at "T" and take the date portion
    const dateOnly = timestamp.split("T")[0];

    // Split the date portion at "-"
    const parts = dateOnly.split("-");

    // Convert the three components into numbers.
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    // Return an object containing day, month and year.
    return {
        day: day,
        month: month,
        year: year
    }
}

function isFutureDate(birthDate, currentDate) {

    if (birthDate.year > currentDate.year)
        return true;

    if (birthDate.year < currentDate.year)
        return false;

    if (birthDate.month > currentDate.month)
        return true;

    if (birthDate.month < currentDate.month)
        return false;

    return birthDate.day > currentDate.day;

}

function validatePastime() {
    const selectedPastime = document.querySelector(
        'input[name="pastime"]:checked'
    );

    if (selectedPastime === null) {
        return false;
    } else {
        return true;
    }
}

async function validateForm(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const phoneNumber = document.getElementById("phone-number").value;
    const dob = document.getElementById("dob").value;

    if (!validateName(name)) {
        alert("Please enter a valid name.");
        return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
        alert("Please enter a valid phone number.");
        return;
    }


    if (!validateBirthDate(dob)) {
        alert("Please enter a valid birth date.");
        return;
    }

    if (!validatePastime()) {
        alert("Please select a favourite pastime.");
        return;
    }

    const birthDate = extractDateComponents(dob);
    let currentDate;

    try {
        currentDate = await getCurrentDate();
    } catch (error) {
        alert("Unable to retrieve the current date. Please try again.");
        return;
    }


    if (isFutureDate(birthDate, currentDate)) {
        alert("Birth date cannot be in the future.");
        return;
    }

    event.target.submit();
}


const form = document.getElementById("user-form");
form.addEventListener("submit", validateForm);
