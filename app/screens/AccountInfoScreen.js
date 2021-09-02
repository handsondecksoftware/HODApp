import React, { Component}  from 'react';
import { View, Text, StyleSheet , Dimensions, Image, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Modal} from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons'; 
import FlipToggle from 'react-native-flip-toggle-button'
import { ScrollView } from 'react-native-gesture-handler';

const base = require('../helpers/base');
const nav = require('../helpers/navigation');
const api = require('../helpers/apiRoutes');

var display_name = null;
var username = null;
var email = null;
var old_password = null;
var new_password = null;
var repeat_new_pass = null;

class AccountInfoScreen extends Component 
    {
    state = {
        data:'', 
        token: null,
        leaderboardToggle: true, 
        editState: false, 
        modalVisible: false,
        updateComponent: false,
        currentUserMessage: "",
        }

    constructor(props) { super(props); }

    handleUsername = (text) => { username = text }  
    handleDisplayName = (text) => { display_name = text }  
    handleEmail = (text) => { email = text }
    handleOldPassword = (text) => { old_password = text } 
    handleNewPassword = (text) => { new_password = text } 
    handleRepeatNewPassword = (text) => { repeat_new_pass = text }  

    setModalVisible(visible) { this.setState({modalVisible: visible}); }

    async handleChangePassword()
        {
        try 
            {
            if(new_password != repeat_new_pass) 
                {
                alert('Passwords do not match!')
                }
            else
                {
                const body = { oldPassword: old_password, newPassword: new_password };
                console.log(body);
                const response = await base.apiCall(this.state.token, api.changePassword.route, api.changePassword.method, body);

                console.log(response);

                if(response.success)
                    {
                    this.setModalVisible(false)
                    this.setState({currentUserMessage: "Password Updated"}); 
                    }
                else
                    {
                    alert('Invalid old password provided')
                    }
                }
            } 
        catch (error) { console.error(error); }
        }

    pressChangePassword()
        {
        return (
            <View style={styles.modalView}>
                <Modal animationType="slide" transparent={true} visible={this.state.modalVisible}
                    onRequestClose={() => { Alert.alert('Modal has been closed.');}}>
                    <Text style={styles.modalText}>Hello World!</Text>
                </Modal>
            </View>
            )
        }

    renderLeaderboardText()
        {
        if(this.state.data.leaderboards)
            {
            return <Text style={styles.contentTextStyle}>Yes</Text>
            }
        else if(!this.state.data.leaderboards)
            {
            return <Text style={styles.contentTextStyle}>No</Text>
            }
        else 
            {
            return <Text>Uh oh! Something went wrong!</Text>
            }
        }

    async componentDidMount() 
        {
        try 
            {
            const result = await base.isAuthenticated();

            if(result.authenticated)
                {
                const body = { vol_ID: 0 };
                const response = await base.apiCall(result.token, api.getVolunteerData.route, api.getVolunteerData.method, body);

                this.setState({ token: result.token, data: response.volunteerData });
                }
            else
                {
                this.props.navigation.navigate({routeName: nav.signIn, params: {message: "Please Sign In"}});
                }
            }
        catch (error) { console.error(error); }
        }

    /*
    async getUpdatedInfo()
        {
        try 
            {
            const body = { vol_ID: 0 };
            const response = await base.apiCall(this.state.token, api.getVolunteerData.route, api.getVolunteerData.method, body);

            if (response.success)
                this.setState({ data: response.volunteerData });
            else if (response.errorcode == 50)
                // alert('Please log in again.'); -- ideally we want a message on the signin page
                this.props.navigation.navigate({routeName: nav.signIn})
            else
                alert("Something unexpected happened. Please try reloading the page");
            } 
        catch (error) { console.error(error); }
        }
    */
   
    renderMainContent()
        {
        if(this.state.editState) { return this.renderEditAccountInfo(); }
        else { return this.renderAccountInfo() }
        }

    async saveUpdatedVolunteerInfo()
        {
        try {
            var updatedInfo = this.state.data;
            if(email != null) { updatedInfo.email = email }
            if(username != null) { updatedInfo.username = username }
            if(display_name != null){ updatedInfo.name = display_name }

            //this.setState({updatedInfo});   // Umm...

            const body = { volunteerData: updatedInfo };
            const response = await base.apiCall(this.state.token, api.editVolunteer.route, api.editVolunteer.method, body);

            if (response.success)
                {
                this.setState({ data: updatedInfo, editState: false});
                this.setState({currentUserMessage: "Information Updated"}); 
                }
            else 
                {
                alert("Something went wrong on our end updating your information. Please try again");
                }
            } 
        catch (error) { console.error(error); }
        }
    
    handleLeaderboardToggle(value)
        {
        var updatedData = this.state.data;

        updatedData.leaderboards = value;
        if(email != null) { updatedData.email = email }
        if(username != null) { updatedData.username = username }
        if(display_name != null) { updatedData.name = display_name }
        
        this.setState({data: updatedData});
        }

    renderEditAccountInfo()
        {
        return(
            <SafeAreaView style={styles.screen}>
                <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "position" : "height"} keyboardVerticalOffset={2} style={styles.EditAccKeyboardAvoidingView}>
                    <View style={styles.headerKeyboardView}>
                        <View style={styles.menuButtonView}>
                            <View style={styles.menuButtom}>
                                <Entypo  name="menu" size={42} color="green" onPress={() => { this.props.navigation.toggleDrawer();}}/>
                            </View>
                        </View>
                        <View style={styles.headerSpace}></View>
                        <View style={styles.imageView}>
                            <Image source={require("../assets/HOD_Logo.png")} style={styles.logo} />
                        </View>
                    </View>
                    <View style={styles.titleSectionKeyboardView}>
                        <View style={styles.titleKeyboardView}>
                            <Text style={styles.TitleTextStyle} adjustsFontSizeToFit>Account Info</Text>
                        </View>
                    </View>
                    <View style={styles.editAccView}>
                        <View style={styles.buttonsView}>
                            <View style={styles.editAccButtons}>
                                <TouchableOpacity onPress={() => this.setState({editState: false})}>
                                    <Text adjustsFontSizeToFit style={styles.editTextStyle}>Cancel</Text> 
                                </TouchableOpacity>
                            </View>
                            <View style={styles.editAccButtons}>
                                <TouchableOpacity onPress={()=>this.saveUpdatedVolunteerInfo()}>
                                    <Text adjustsFontSizeToFit style={styles.editTextStyle}>Save</Text> 
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.displayNameView}>
                            <TextInput clearTextOnFocus={true} placeholder={this.state.data.name} placeholderTextColor='grey' style={styles.textBox} autoCorrect={false} textContentType={'username'} autoCapitalize='none' onChangeText={this.handleDisplayName}></TextInput>
                        </View>
                        <View style={styles.avoidingViewInfoTile}>
                            <View style={styles.leaderboardEditTextTile}>
                                <Text adjustsFontSizeToFit style={styles.leaderboardText}>Username:</Text>
                            </View>
                            <View style={styles.displayUsernameView}>
                                <TextInput placeholder={this.state.data.username} placeholderTextColor='grey' style={styles.textBox} autoCorrect={false} textContentType={'username'} autoCapitalize='none' onChangeText={this.handleUsername}></TextInput>
                            </View>
                        </View>
                        <View style={styles.avoidingViewInfoTile}>
                            <View style={styles.leaderboardEditTextTile}>
                                <Text adjustsFontSizeToFit style={styles.leaderboardText}>Email:</Text>
                            </View>
                            <View style={styles.displayEmailView}>
                                <TextInput placeholder={this.state.data.email} placeholderTextColor='grey' style={styles.textBox} autoCorrect={false} textContentType={'emailAddress'} autoCapitalize='none' onChangeText={this.handleEmail}></TextInput>
                            </View>
                        </View>
                        <View style={styles.editInfoLeaderboards}>
                            <View style={styles.leaderboardTile}>
                                <View style={styles.leaderboardEditTextTile}>
                                    <Text adjustsFontSizeToFit style={styles.leaderboardTextSmall}>Include me in Leaderboards:</Text>
                                </View>
                                <View style={styles.switchAreaView}>
                                    <View style={styles.toggleSwitchView}>
                                        <FlipToggle
                                            value={this.state.data.leaderboards}
                                            buttonWidth={100}
                                            buttonHeight={50}
                                            buttonRadius={50}
                                            sliderWidth={40}
                                            sliderHeight={40}
                                            buttonOffColor={'rgb(50,100,25)'}
                                            sliderOffColor={'rgb(243,215,77)'}
                                            buttonOnColor={'rgb(50,100,25)'}
                                            sliderOnColor={'rgb(243,215,77)'}
                                            onToggle={(value) => { this.handleLeaderboardToggle(value) }}
                                            onToggleLongPress={() => {}}/>
                                    </View>
                                    <View style={styles.toggleSwitchText}>
                                        {this.renderLeaderboardText()}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>    
                <View style={styles.editAccFiller}></View>        
            </SafeAreaView>     
            );
        }

    renderAccountInfo()
        {
        return (
            <SafeAreaView style={styles.screen}>
                <View style={styles.header}>
                    <View style={styles.menuButtonView}>
                        <View style={styles.menuButtom}>
                            <Entypo name="menu" size={42} color="green" onPress={() => { this.props.navigation.toggleDrawer();}}/>
                        </View>
                    </View>
                    <View style={styles.headerSpace}></View>
                    <View style={styles.imageView}>
                        <Image source={require("../assets/HOD_Logo.png")} style={styles.logo} />
                    </View>
                </View>
                <View style={styles.content}>
                    <ScrollView>
                        <View style={{marginBottom: 10}}>
                            <View style={styles.titleSection}>
                                <View style={styles.title}>
                                    <Text style={styles.TitleTextStyle} adjustsFontSizeToFit>Account Info</Text>
                                </View>
                            </View>
                            <View style={styles.editView}>
                                <View style={styles.topRow}>
                                    <View style={styles.userMessage}>
                                        <Text adjustsFontSizeToFit style={styles.userMessageStyle}>{this.state.currentUserMessage}</Text> 
                                    </View>
                                    <View style={styles.editButton}>
                                        <TouchableOpacity onPress={() => this.setState({editState: true})}>
                                            <Text adjustsFontSizeToFit style={styles.editTextStyle}>Edit</Text> 
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.userDefaultInfo}>
                                    <Text style={styles.headerTextStyle} adjustsFontSizeToFit>{this.state.data.name}</Text>
                                </View>
                                <View style={styles.userDefaultInfo}>
                                    <Text style={styles.headerTextStyle} adjustsFontSizeToFit>{this.state.data.teamname}</Text>
                                </View>
                                <View style={styles.infoTile}>
                                    <View style={styles.leaderboardTextTile}>
                                        <Text adjustsFontSizeToFit style={styles.leaderboardText}>Username:</Text>
                                    </View>
                                    <View style={styles.renderedTextView}>
                                        <Text style={styles.contentTextStyle}>{this.state.data.username}</Text>
                                    </View>
                                </View>
                                <View style={styles.infoTile}>
                                    <View style={styles.leaderboardTextTile}>
                                        <Text adjustsFontSizeToFit style={styles.leaderboardText}>Password:</Text>
                                    </View>
                                    <View style={styles.renderedTextView}>
                                        <View style={styles.changePasswordButton}>
                                            <Text adjustsFontSizeToFit onPress={() =>this.setModalVisible(true)} style={styles.editTextStyle}>Change</Text> 
                                        </View>
                                    </View>
                                    <Modal animationType="slide" transparent={true} visible={this.state.modalVisible} onRequestClose={() => { Alert.alert('Modal has been closed.'); }}>
                                        <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "position" : "height"} style={styles.ModalKeyboardAvoidingContainer}>
                                            <View style={styles.aboveModalView}>
                                                <TouchableOpacity onPress={()=>this.setModalVisible(false)}>
                                                    <View style={styles.completeFill}></View>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={styles.modalView}>
                                                <View style={styles.modalTitleView}>
                                                    <Text style={styles.modalHeaderTextStyle}>Change Password</Text>
                                                </View>
                                                <View style={styles.modalContentView}>
                                                    <View style={styles.modalContentTextInputView}>
                                                        <View style={styles.modalContentInduvidualInputView}>
                                                            <View style={styles.modalContentInduvidualInputDivider}>
                                                                <Text style={styles.modalContentTextStyle} adjustsFontSizeToFit>Old Password: </Text>
                                                            </View>
                                                            <View style={styles.modalContentInduvidualInputDivider}>
                                                                <TextInput secureTextEntry={true} placeholder="Old" placeholderTextColor='grey' style={styles.modalTextBox} autoCorrect={false} textContentType={'password'} autoCapitalize='none' onChangeText={this.handleOldPassword}></TextInput>
                                                            </View>
                                                        </View>
                                                        <View style={styles.modalContentInduvidualInputView}>
                                                            <View style={styles.modalContentInduvidualInputDivider}>
                                                                <Text style={styles.modalContentTextStyle} adjustsFontSizeToFit>New Password: </Text>
                                                            </View>
                                                            <View style={styles.modalContentInduvidualInputDivider}>
                                                                <TextInput secureTextEntry={true} placeholder="New" placeholderTextColor='grey' style={styles.modalTextBox} autoCorrect={false} textContentType={'password'} autoCapitalize='none' onChangeText={this.handleNewPassword}></TextInput>
                                                            </View>
                                                        </View>
                                                        <View style={styles.modalContentInduvidualInputView}>
                                                            <View style={styles.modalContentInduvidualInputDivider}>
                                                                <Text style={styles.modalContentTextStyle} adjustsFontSizeToFit>Repeat Password: </Text>
                                                            </View>
                                                            <View style={styles.modalContentInduvidualInputDivider}>
                                                                <TextInput secureTextEntry={true} placeholder="Repeat New" placeholderTextColor='grey' style={styles.modalTextBox} autoCorrect={false} textContentType={'newPassword'} autoCapitalize='none' onChangeText={this.handleRepeatNewPassword}></TextInput>
                                                            </View>
                                                        </View>
                                                    </View>
                                                    <View style={styles.modalContentButtonView}>
                                                        <View style={styles.modalButton}>
                                                            <TouchableOpacity onPress={()=>this.setModalVisible(false)}>
                                                                <Text adjustsFontSizeToFit style={styles.editTextStyle}>Cancel</Text> 
                                                            </TouchableOpacity>
                                                        </View>
                                                        <View style={styles.modalButton}>
                                                            <TouchableOpacity onPress={()=>this.handleChangePassword()}>
                                                                <Text adjustsFontSizeToFit style={styles.editTextStyle}>Confirm</Text> 
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </KeyboardAvoidingView>
                                    </Modal>
                                </View>
                                <View style={styles.infoTile}>
                                    <View style={styles.leaderboardTextTile}>
                                        <Text adjustsFontSizeToFit style={styles.leaderboardText}>Email:</Text>
                                    </View>
                                    <View style={styles.renderedTextView}>
                                        <Text style={styles.contentTextStyle}>{this.state.data.email}</Text>
                                    </View>
                                </View>
                                <View style={styles.infoTile}>
                                    <View style={styles.leaderboardTextTile}>
                                        <Text adjustsFontSizeToFit style={styles.leaderboardTextSmall}>Include me in Leaderboards:</Text>
                                    </View>
                                    <View style={styles.renderedTextView}>
                                        {this.renderLeaderboardText()}
                                    </View>
                                </View>
                                <View style={styles.footerSpace}></View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
            );
        }

    render() { return this.renderMainContent() }
    };

const styles = StyleSheet.create(
    {
    screen: {
        flex: 1,
        width:'100%',
        marginTop: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content:{
        flex: 18, 
        width: '100%',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'space-around',
    },
    fullScreen: {
        width:'100%',
        height:'100%',
    },
    KeyboardAvoidingContainer: {
        height:'72%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ModalKeyboardAvoidingContainer: {

    },  
    EditAccKeyboardAvoidingView: {
        width:'100%',
        height:'77%',
    },  
    header:{
        width: '100%',
        height:'14%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    headerKeyboardView:{
        width: '100%',
        height:'18.5%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    footerSpace:{
        justifyContent: 'flex-start',
        alignSelf: 'flex-end',
        width: '57%',
        height: '100%',
        },
    titleSection:{
        width: '100%',
        height:'8%',
        marginTop:'3%',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
    },
    titleSectionKeyboardView:{
        width: '100%',
        height:'11%',
        marginTop:'3%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuButtonView:{
        justifyContent: 'center',
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
        width: '15%',
        height: '100%',
        padding: 2,   
    },
    imageView:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        width: '28%',
        marginHorizontal: '1%',
        height: '100%',
    },
    logo:{
        width: Dimensions.get('window').width * 0.2,
        height: Dimensions.get('window').width * 0.2,
    marginTop:'2%',
    },
    headerSpace:{
        justifyContent: 'flex-start',
        alignSelf: 'flex-end',
        width: '57%',
        height: '100%',
    },
    title:{
        backgroundColor: 'rgb(50,100,25)',
        width: '95%',
        height:'90%',
        alignSelf: 'center',
        justifyContent:'center',
        marginTop: '1%',
        borderRadius: 10,
        borderColor: 'black',
        borderWidth: 0.5,
        padding:3
    },
    titleKeyboardView:{
        backgroundColor: 'rgb(50,100,25)',
        width: '95%',
        height:'85%',
        alignSelf: 'center',
        justifyContent:'center',
        marginTop: '0%',
        borderRadius: 10,
        borderColor: 'black',
        borderWidth: 0.5,
        padding:3
    },
    editView:{
        width: '95%',
        height:'75%',
        alignSelf: 'center',
    },
    editAccView:{
        width: '98%',
        height:'68%',
        alignSelf: 'center',
    },
    editAccFiller:{
        width:'100%',
        height:'23%',
    },
    editInfoLeaderboards:{
        width: '98%',
        height:'27%',
        alignSelf: 'center',
    },
    buttonsView:{
        width: '97%',
        alignItems:'center',
        height:'12.5%',
        alignSelf: 'center',
        flexDirection:'row',
        justifyContent:'space-between',
    },
    userDefaultInfo:{
        backgroundColor: 'rgb(243,215,77)',
        width: '94%',
        height:'9%',
        alignSelf: 'center',
        justifyContent:'center',
        marginTop: '2%',
        marginHorizontal: '7%',
        marginBottom: '2%',
        borderRadius: 10,
        borderColor: 'black',
        borderWidth: 0.5,
        padding:3
    },
    TitleTextStyle:{
        fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 50,
        textAlign: 'center',
        fontWeight: 'bold',
        color:'white',
    },
    headerTextStyle:{
        fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 40,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    topRow: {
        width: "100%",
        height: 45,
        flexDirection:'row',
        width:'100%',
        justifyContent:'space-between',
        paddingHorizontal: '5%',
        paddingTop: '2%',
        marginTop: '4%'
    },
    userMessage:{
        width: '65%',
        borderRadius: 9,
        alignSelf:'flex-start',
        marginHorizontal: '1%',
        marginBottom: '1%',
    },
    userMessageStyle: {
        fontSize: 18,
        color: 'rgb(50,100,25)',
    },
    editTextStyle:{
        fontSize: 30,
        textAlign: 'center',
    },
    editButton:{
        backgroundColor: 'rgb(243,215,77)',
        width: '35%',
        height:'100%',
        borderRadius: 9,
        alignSelf:'flex-end',
        marginRight: '5%',
        marginHorizontal: '2%',
        marginBottom: '3%',
    },
    changePasswordButton:{
        backgroundColor: 'rgb(243,215,77)',
        width: '40%',
        height:'95%',
        justifyContent:'center',
        borderRadius: 9,
        alignSelf:'center',
        alignItems:'center',
        justifyContent:'center',
        marginTop: '2%',
        marginHorizontal: '4%',
        marginBottom: '1%',
    },
    editAccButtons:{
        backgroundColor: 'rgb(243,215,77)',
        width: '35%',
        height:'85%',
        justifyContent:'center',
        borderRadius: 9,
    },
    leaderboardTextTile:{
        width: '100%',
        height:'40%',
        justifyContent :'center',
        padding:1,
    },
    leaderboardEditTextTile:{
        width: '100%',
        height:'45%',
        justifyContent :'center',
    },
    leaderboardText:{
        color: 'rgb(50,100,25)',
        fontWeight:'bold',
        fontSize: 25,
    },
    leaderboardTextSmall:{
        color: 'rgb(50,100,25)',
        fontWeight:'bold',
        fontSize: 23,
    },
    renderedTextView:{
        width: '100%',
        height:'60%',
        alignItems:'center',
        justifyContent:'center',
        marginBottom: '1%', 
    },
    infoTile:{
        width: '100%',
        height:'20%',
        alignSelf: 'center',
        marginVertical:'1%',
    },
    avoidingViewInfoTile:{
        width: '100%',
        height:'20%',
        alignSelf: 'center',
    },
    leaderboardTile:{
        width: '100%',
        height:'100%',
        alignSelf: 'center',
        alignItems:'center',
        justifyContent:'center',
    },
    contentTextStyle:{
        fontSize:27,
        fontWeight:'bold'
    },
    textBox: {
        backgroundColor: 'black',
        borderRadius: 7,
        color: 'white',
        fontSize: 20,
        width: '96%',
        padding: 5,
        alignSelf:'center',
    },
    displayNameView:{
        width:'100%',
        height:'14%',
        justifyContent:'center',
        alignItems:'center',
    },
    displayEmailView:{
        width:'100%',
        height:'55%',
        justifyContent:'center',
    },
    displayUsernameView:{
        width:'100%',
        height:'55%',
        justifyContent:'center',
    },
    toggleSwitchView:{
        width: '40%',
        height:'100%',
        paddingLeft: 50,
        justifyContent:'center'
    },
    switchAreaView:{
        width:'100%',
        height:'50%',
        flexDirection:'row',
        justifyContent:'space-between'
    }, 
    toggleSwitchText:{
        alignItems:'center',
        justifyContent:'center',
        width: '40%',
        height:'100%',
    },
    modalView:{
        height:'40%',
        width:'100%',
        alignSelf:'center',
        backgroundColor: 'rgba(0,0,0,.5)',
    },
    aboveModalView:{
        height:'60%',
        width:'100%',
        backgroundColor: 'rgba(0,0,0,.5)',

    },
    completeFill:{
        height:'100%',
        width:'100%',
    },
    modalTitleView:{
        height:'18%',
        width:'100%',
        backgroundColor:'lightgrey',
        justifyContent:'center',
        borderColor:'black',
        borderWidth:1,
        borderTopRightRadius:10,
        borderTopLeftRadius:10
    },
    modalHeaderTextStyle:{
        fontSize: 32,
        textAlign: 'center',
        fontWeight:'600'
    },
    modalContentTextStyle:{
        color: 'rgb(50,100,25)',
        fontSize:21,
        fontWeight:'500'
    },
    modalContentView:{
        height:'82%',
        width:'100%',
        backgroundColor:'white',
        justifyContent:'center',
        borderColor:'black',
        borderLeftWidth:1,
        borderRightWidth:1,
    },
    modalContentTextInputView:{
        height:'70%',
        width:'100%',
        alignItems:'center'
    },
    modalContentButtonView:{
        height:'30%',
        width:'100%',
        flexDirection:'row',
        justifyContent:'space-around'
    },
    modalContentInduvidualInputView:{
        height:'33%',
        width:'97%',
        flexDirection:'row'
    },
    modalContentInduvidualInputDivider:{
        height:'100%',
        width:'50%',
        justifyContent:'center'
    },
    modalTextBox: {
        backgroundColor: 'black',
        borderRadius: 7,
        color: 'white',
        fontSize: 19,
        width: '98%',
        padding: 5,
        alignSelf:'center',
    },
    modalButton:{
        backgroundColor: 'rgb(243,215,77)',
        width: '46%',
        height:'65%',
        justifyContent:'center',
        borderRadius: 7,
    },
    });

export default AccountInfoScreen;

