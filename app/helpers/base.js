/******************************************************************
 * base.js -- this file will provide a common location for functions used across the app
 * 
 * Ryan Stolys - July 26, 2021
 *  File Created. Base logic take from Angad Aujila
 * 
 * All Rights Reserved © Hands On Deck Software
 *****************************************************************/

import * as SecureStore from 'expo-secure-store';
const api = require('./apiRoutes');

const contentType_json = "application/json";
const mobileBaseBody = { "isMobile": "true" };

export const STORAGE_KEY = 'save_jwt';


/**
 * Will call an API to validate our current token.
 * @returns boolean indicating of the success of the token verification
 */
exports.isAuthenticated = async () =>
    {
    var result = {authenticated: false, token: null};
    try 
        {
        const token = await readSecureStorage(STORAGE_KEY);
        if (token != null)
            {
            const response = await internalApiCall(token, api.isTokenValid.route, api.isTokenValid.method, {});

            result.authenticated = response?.success ?? false;
            result.token = token;
            }
        else 
            {
            console.warn("There was no authentication token found.");
            result.authenticated = false;
            }
        } 
    catch (error) 
        { 
        console.error(error);
        result.authenticated = false;
        }

    return result;
    }


/**
 * General function for making API call
 * @param {JWT} token User authentication token
 * @param {string} url The API url to be called
 * @param {string} method The method to use in fetch call
 * @param {JSON} body The body content to be added to base
 * @returns The response of the API call
 */
exports.apiCall = async (token, url, method, body = {}) =>
    {
    return await internalApiCall(token, url, method, body);
    }


/**
 * Internal function that implements the API fetch
 * @param {JWT} token User authentication token
 * @param {string} url The API url to be called
 * @param {string} method The method to use in fetch call
 * @param {JSON} body The body content to be added to base
 * @returns The response of the API call
 */
async function internalApiCall(token, url, method, body)
    {
    const response = await fetch(url, 
        {
        method: method,
        headers: {
            "Content-Type": contentType_json,
            "Authorization": "Bearer " + token,
            },
        body: JSON.stringify({ ...mobileBaseBody, ... body })
        });
    
    var json;
    try 
        {
        json = await response.json();
        }
    catch (error) 
        {
        console.log(error);
        json = { success: false, errorcode: -1 };
        }
    
    return json;
    }


/**
 * Fetch content stored on the device identified by the key.
 * @param {string} key The key to access data from secure storage on the device
 * @returns The content accessed from the device secure storage
 */
async function readSecureStorage(key)
    {
    return await SecureStore.getItemAsync(key);
    }

/**
 * Save a value in the device secure storage
 * @param {string} key The key for the secure storage item
 * @param {string} value The value to be stored at the key 
 * @returns The outcome of the storage request
 */
exports.setSecureStorage = async (key, value) =>
    {
    return await setSecureStorageInternal(key, value);
    }


/**
 * Save a value in the device secure storage
 * @param {string} key The key for the secure storage item
 * @param {string} value The value to be stored at the key 
 * @returns The outcome of the storage request
 */
async function setSecureStorageInternal(key, value)
    {
    var success = true;

    try { await SecureStore.setItemAsync(key, value) } 
    catch (e) { success = false; }

    return success;
    }

/**
 * Computes the duration in hours of the opportunitiy;
 * @param {oppInfo} item An opportunitiy Information object
 * @returns A number representing the duration in hours
 */
exports.computeDuration = (item) =>
    {
    //Change start time to human readable Date
    const starttime = new Date(item.starttime);
    const start_hour = starttime.getUTCHours();
    const start_minutes = starttime.getMinutes();

    const endtime = new Date(item.endtime);
    const end_hour = endtime.getUTCHours();
    const end_minutes = endtime.getMinutes();

    var hour_duration = end_hour - start_hour;
    var minute_duration = Math.abs(end_minutes - start_minutes) / 60;

    return Number(hour_duration + minute_duration);
    }
    

/**
errors: {
    "-1": "NOT_SUPPORTED",
    "0": "NOERROR",
    "1": "DATABASE_ACCESS_ERROR",
    "2": "SERVER_ERROR",
    "3": "PERMISSION_ERROR",
    "10": "INVALID_INPUT_ERROR",
    "50": "NOT_AUTHENTICATED",
    "99": "UNKNOWN_ERROR",
}
*/