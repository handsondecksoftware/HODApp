/******************************************************************
 * apiRoutes.js -- this file will provide the api routes in a common place
 * 
 * Ryan Stolys - July 26, 2021
 *  File Created
 * 
 * All Rights Reserved © Hands On Deck Software
 *****************************************************************/

const baseURL = "https://handsondeck.herokuapp.com/api";
//const baseURL = "http://localhost:5000/api";

/**
 * Method Options
 */
const methodPOST = "POST";

/**
 * Authentication APIs
 */
export const signIn = {
    route: baseURL + "/signIn",
    method: methodPOST
    };

export const isTokenValid = {
    route: baseURL + "/isTokenValid",
    method: methodPOST
    };

/**
 * Account APIs
 */
export const editVolunteer = {
    route: baseURL + "/editVolunteer",
    method: methodPOST
    };

export const changePassword = {
    route: baseURL + "/changePassword",
    method: methodPOST
    };

export const createAccount = {
    route: baseURL + "/createAccount",
    method: methodPOST
    };

/**
 * Institution APIs
 */
export const getAllInstitutionInfo = {
    route: baseURL + "/getAllInstitutionInfo",
    method: methodPOST
    };

/**
 * Team APIs
 */
export const getAllTeamInfo = {
    route: baseURL + "/getAllTeamInfo",
    method: methodPOST
    };

/**
 * Opportunity APIs
 */
export const getOpportunityInfo = {
    route: baseURL + "/getOpportunityInfo",
    method: methodPOST
    };

export const getOpportunityData = {
    route: baseURL + "/getOpportunityData",
    method: methodPOST
    };

/**
 * VolunteeringData APIs
 */
export const addVolunteeringData = {
    route: baseURL + "/addVolunteeringData",
    method: methodPOST
    };

export const getVolunteeringData = {
    route: baseURL + "/getVolunteeringData",
    method: methodPOST
    };

export const deleteVolunteeringData = {
    route: baseURL + "/deleteVolunteeringData",
    method: methodPOST
    };
    
/**
 * Leaderboard APIs
 */
export const getTeamLeaderboard = {
    route: baseURL + "/getTeamLeaderboard",
    method: methodPOST
    };

export const getVolunteerLeaderboard = {
    route: baseURL + "/getVolunteerLeaderboard",
    method: methodPOST
    };
 
 /**
 * Volunteer API
 */
export const getVolunteerData = {
    route: baseURL + "/getVolunteerData",
    method: methodPOST
    };

export const getVolunteerInfo = {
    route: baseURL + "/getVolunteerInfo",
    method: methodPOST
    };