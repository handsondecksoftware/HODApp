import React, { Component }  from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, Image, Platform, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, TouchableHighlight, Keyboard} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { endAsyncEvent } from 'react-native/Libraries/Performance/Systrace';

const base = require('../helpers/base');
const nav = require('../helpers/navigation');
const api = require('../helpers/apiRoutes');

const PARAM_MESSAGE = "message";
const UPDATE_ACC_INFO = 'update_bool';
var username = '';
var password = '';

class SignInScreen extends Component 
    {
    state = { 
        data: [], 
        access_token:null, 
        username:null , 
        password:null, text:'', 
        flip: false, 
        spinner: false,
        viewError: false,
        errorMessage: "", 
        forgotPasswordMsg: "",
        }

    constructor(props) { super(props); }

    handleUsername = (text) => { username = text }  
    handlePassword = (text) => { password = text }  

    async saveToken(jwt_token)
        {
        var success = base.setSecureStorage(base.STORAGE_KEY, jwt_token);

        if(!success)
            console.error("Failire occurred trying to save the jwt");
        }

    async saveStatus()
        {
        var success = base.setSecureStorage(UPDATE_ACC_INFO, jwt_token);

        if(!success)
            console.error("Failire occurred trying to save update account info object");
        }

    async handleSignIn()
        {
        try 
            {
            const body = { username: username, password: password };
            const response = await base.apiCall(this.state.token, api.signIn.route, api.signIn.method, body);

            if(response.success)
                {
                this.saveToken(response.access_token);
                username = null;
                password = null;
                this.setState({spinner:false});
                this.props.navigation.navigate({routeName: nav.Opportunties});
                }
            else
                {
                this.setState({
                    spinner: false, 
                    viewError: true, 
                    errorMessage: response.message
                    });  
                }
            } 
        catch (error) 
            { 
            this.setState({
                spinner: false, 
                viewError: true, 
                errorMessage: "Something unexpected happened. Please try again"
                });
            console.error(error); 
            }
        }

    async componentDidMount()
        {
        try 
            { 
            var message = this.props.navigation.getParam(PARAM_MESSAGE);
            var forgotPasswordMsg = "Please contact your system admin to reset your password at: saac@sfu.ca";
            this.setState({ username: null, password: null, errorMessage: message, forgotPasswordMsg: forgotPasswordMsg }) 
            }
        catch (error) 
            { 
            console.error(error); 
            }
        }

    render()
        {
        return (
            <SafeAreaView style={styles.container}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={true}>
                    <View style={styles.containerSpinner}>
                        <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "position" : "height"} keyboardVerticalOffset={10} style={styles.avoidView}>
                            <View style={styles.logoView}>
                                <Image source={require("../assets/HOD_Logo.png")} style={styles.icon} />
                            </View>
                            <View style={styles.nameView}>
                                <Text style={styles.nameText}>Hands On Deck</Text>
                            </View>
                            <Spinner visible={this.state.spinner} textContent={'Loading...'} textStyle={styles.spinnerTextStyle} />
                            <View style={styles.emailView}>
                                <TextInput placeholder="Username" placeholderTextColor='grey' style={styles.textBox} autoCorrect={false} textContentType={'username'} autoCapitalize='none' onChangeText={this.handleUsername}></TextInput>
                            </View>
                            <View style={styles.passwordView}>
                                <TextInput placeholder="Password" placeholderTextColor='grey' style={styles.textBox} secureTextEntry autoCorrect={false} textContentType={'password'} onChangeText={this.handlePassword}></TextInput>
                            </View>
                            <View style={styles.signInButtonView}>
                                <TouchableHighlight style={styles.signInButton} underlayColor='#a38b07' onPress={() => {this.setState({spinner: true});this.handleSignIn()}}>
                                    <Text style={styles.signInText}>Sign In</Text>
                                </TouchableHighlight>
                            </View>
                            <View visible={this.state.viewError} style={styles.errorView}>
                                <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
                            </View>
                        </KeyboardAvoidingView>

                        <View style={styles.createAccountButtonView}>
                            <View style={styles.bottomBtnStyle}>
                                <Text style={styles.createAccountText} onPress={() => {this.props.navigation.navigate({routeName: 'CreateAccount'})}}>Create Account</Text>
                            </View> 
                            <View style={styles.bottomBtnStyle}>
                                <Text style={styles.createAccountText} onPress={() => {alert(this.state.forgotPasswordMsg)}}>Forgot Password</Text>
                            </View> 
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </SafeAreaView>
            );
        }
    };

const styles = StyleSheet.create(
    {
    spinnerTextStyle: {
        color: '#FFF'
        },
    containerSpinner: {
        width:'100%',
        height:'100%',
        alignItems: 'center',
        },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        },
    icon: {
        width: 150,
        height: 150
        },
    nameText: {
        textAlign: 'center',
        color: 'rgb(50,100,25)',
        fontSize: 38,
        fontWeight: 'bold'
        },
    errorView: {
        textAlign: 'center',
        fontSize: 20,
        },
    errorMessage: {
        textAlign: 'center',
        color: 'red',
        },
    textBox: {
        backgroundColor: 'black',
        borderRadius: 7,
        color: 'white',
        fontSize: 25,
        width: '85%',
        padding: 10
        },
    signInButton:{
        backgroundColor: 'rgb(243,215,77)',
        borderRadius: 7, 
        width: '80%',
        alignItems: 'center',
        justifyContent: 'center',
        },
    signInText:{
        fontSize: 28,
        padding: 10,
        width: '99%',
        borderRadius: 7, 
        alignItems: 'center',
        textAlign: "center",  
        },
    logoView:{
        height:'30%',
        width:'90%',
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        marginTop:'5%',
        },
    nameView:{
        height:'15%',
        width:'90%',
        justifyContent:'center',
        alignSelf:'center',
        alignItems:'center',
        },
    emailView:{
        height:'15%',
        width:'90%',
        marginTop:'5%',
        justifyContent:'center',
        alignSelf:'center',
        alignItems:'center',
        },
    passwordView:{
        height:'15%',
        width:'90%',
        justifyContent:'center',
        alignSelf:'center',
        alignItems:'center',
        },
    signInButtonView:{
        height:'15%',
        width:'90%',
        marginTop:'5%',
        justifyContent:'center',
        alignSelf:'center',
        alignItems:'center',
        },
    createAccountButtonView:{
        height:'25%',
        width:'90%',
        justifyContent: "center"
        },
    bottomBtnStyle:{
        marginBottom:'5%', 
        alignItems: "center" 
        },
    createAccountText:{
        textDecorationLine: 'underline',
        fontSize:20,
        color:'rgb(50,100,25)',
        },
    avoidView:{
        width:'100%',
        height:'75%',
        },
    });

export default SignInScreen;
