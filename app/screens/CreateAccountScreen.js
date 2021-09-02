import React, { Component }  from 'react';
import { View, Text, StyleSheet , Dimensions, Image, SafeAreaView, KeyboardAvoidingView,TextInput,TouchableOpacity} from 'react-native';
import { AntDesign } from '@expo/vector-icons'; 
import FlipToggle from 'react-native-flip-toggle-button'
import DropDownPicker from 'react-native-dropdown-picker';
import { ScrollView } from 'react-native-gesture-handler';

const base = require('../helpers/base');
const nav = require('../helpers/navigation');
const api = require('../helpers/apiRoutes');

const yellowColour = "rgb(243,215,77)";
const greenColour = "rgb(50,100,25)";

var name = null;
var username = null;
var email = null;
var password = null;

class CreateAccountScreen extends Component 
    {
    state = {
        data:'', 
        leaderboardToggle:true, 
        institutionOpen: false,
        teamOpen: false,
        institutionValue: null,
        teamValue: null,
        institutionItems: [],
        teamItems: [],
        }
    
    constructor(props) 
        {
        super(props);
        this.setInstitutionValue = this.setInstitutionValue.bind(this);
        this.setTeamValue = this.setTeamValue.bind(this);
        }

    handleUsername = (text) => { username = text }  
    handleName = (text) => { name = text }  
    handleEmail = (text) => { email = text }
    handlePassword = (text) => { password = text } 

    async componentDidMount() 
        {
        try {
            const response = await base.apiCall(null, api.getAllInstitutionInfo.route, api.getAllInstitutionInfo.method);

            var institutions = response.iInfo.map( item => { return { label: item.name, value: item.id, id: item.id } });
            this.setState({ institutionItems: institutions });
            } 
        catch (error) { console.error(error); }   
        }


    async getTeamInfo() 
        {
        try {
            const body = { institution_id : this.state.institutionValue }
            const response = await base.apiCall(null, api.getAllTeamInfo.route, api.getAllTeamInfo.method, body);

            var teams = response.teamInfo.map( item => { return { label: item.sex + " - " + item.name, value: item.id } })
            this.setState({ teamItems: teams });
            } 
        catch (error) { console.error(error); }
        }

    setInstitutionValue(callback) { this.setState(state => ({ institutionValue: callback(state.institutionValue) })); }
    setTeamValue(callback) { this.setState(state => ({ teamValue: callback(state.teamValue) })); }
    setInstitutionItems(callback) { this.setState(state => ({ institutionItems: callback(state.institutionItems) })); }
    setTeamItems(callback) { this.setState(state => ({ teamItems: callback(state.teamItems) })); }

    setInstitutionOpen = ({ })  => 
        {
        if (this.state.institutionOpen) {this.setState({institutionOpen:false}) }
        else { this.setState({institutionOpen:true, teamOpen:false}) } 
        }
  
    setTeamOpen =  ({ })  => 
        {
        this.getTeamInfo();
        
        if(this.state.teamOpen) { this.setState({teamOpen:false}) } 
        else { this.setState({teamOpen:true, institutionOpen:false}) }
        }

    renderLeaderboardText()
        {
        if(this.state.leaderboardToggle) { return <Text style={styles.toggleText}>Yes</Text> }
        else { return <Text style={styles.toggleText}>No</Text> }
        }

    async createAccount()
        {
        try 
            {
            const body = { 
                institution_id: this.state.institutionValue, 
                name: name, 
                username: username, 
                email: email, 
                password: password, 
                institution_id: this.state.institutionValue,
                team_id: this.state.teamValue,
                leaderboards: this.state.leaderboardToggle
                };
            const response = await base.apiCall(null, api.createAccount.route, api.createAccount.method, body);

            if (response.success) { this.props.navigation.navigate({routeName: nav.signIn}) }
            else if (response.errorcode == 10) { alert("Soemthing was wrong with the input fields. Please fix them and try again"); }
            else { alert("Soemthing went wrong on our end. Please try again"); } 
            } 
        catch (error) { console.error(error); }
        }

    render()
        {
        const { institutionOpen, institutionValue, institutionItems , teamOpen, teamValue, teamItems} = this.state;

        return (
            <SafeAreaView style={styles.screen}>
                <View style={styles.header}>
                    <View style={styles.menuButtomView}>
                        <View style={styles.menuButtom}>
                            <AntDesign  name="arrowleft" size={46} color="green" onPress={() => {this.props.navigation.navigate({routeName: nav.signIn})}}/>
                        </View>
                    </View>
                    <View style={styles.headerSpace}></View>
                    <View style={styles.imageView}>
                        <Image source={require("../assets/HOD_Logo.png")} style={styles.logo} />
                    </View>
                </View>
                <View style={styles.title}>
                    <Text style={styles.TitleTextStyle} adjustsFontSizeToFit>Create Account</Text>
                </View>
                <View style={styles.overallContent}>
                    <ScrollView>
                        <View style={styles.avoidingViewInfoTile}>
                            <View style={styles.createAccountTextTile}>
                                <Text adjustsFontSizeToFit style={styles.createAccountText}>Display Name:</Text>
                            </View>
                            <View style={styles.displayTextInputView}>
                                <TextInput placeholder="Name" placeholderTextColor='grey' style={styles.textBox} autoCorrect={false} textContentType={'name'} autoCapitalize='none' onChangeText={this.handleName}></TextInput>
                            </View>
                        </View>
                        <View style={styles.avoidingViewInfoTile}>
                            <View style={styles.createAccountTextTile}>
                                <Text adjustsFontSizeToFit style={styles.createAccountText}>Username:</Text>
                            </View>
                            <View style={styles.displayTextInputView}>
                                <TextInput placeholder="Username" placeholderTextColor='grey' style={styles.textBox} autoCorrect={false} textContentType={'username'} autoCapitalize='none' onChangeText={this.handleUsername}></TextInput>
                            </View>
                        </View>
                        <View style={styles.avoidingViewInfoTile}>
                            <View style={styles.createAccountTextTile}>
                                <Text adjustsFontSizeToFit style={styles.createAccountText}>Email (Optional):</Text>
                            </View>
                            <View style={styles.displayTextInputView}>
                                <TextInput placeholder="Email" placeholderTextColor='grey' style={styles.textBox} autoCorrect={false} textContentType={'emailAddress'} autoCapitalize='none' onChangeText={this.handleEmail}></TextInput>
                            </View>
                        </View>
                        <View style={styles.avoidingViewInfoTile}>
                            <View style={styles.createAccountTextTile}>
                                    <Text adjustsFontSizeToFit style={styles.createAccountText}>Password:</Text>
                            </View>
                            <View style={styles.displayTextInputView}>
                                <TextInput placeholder="Password" placeholderTextColor='grey' style={styles.textBox} autoCorrect={false} textContentType={'password'} secureTextEntry={true} autoCapitalize='none' onChangeText={this.handlePassword}></TextInput>
                            </View>
                        </View>
                        <View style={styles.avoidingViewInfoTile}>
                            <View style={styles.leaderboardTile}>
                                <View style={styles.leaderboardTextTile}>
                                    <Text adjustsFontSizeToFit style={styles.createAccountText}>Include me in Leaderboards:</Text>
                                </View>
                                <View style={styles.switchAreaView}>
                                    <View style={styles.toggleSwitchView}>
                                        <FlipToggle
                                            value={this.state.leaderboardToggle}
                                            buttonWidth={85}
                                            buttonHeight={40}
                                            buttonRadius={50}
                                            sliderWidth={35}
                                            sliderHeight={35}
                                            buttonOffColor={greenColour}
                                            sliderOffColor={yellowColour}
                                            buttonOnColor={greenColour}
                                            sliderOnColor={yellowColour}
                                            onToggle={(value) => { this.setState({leaderboardToggle:value}); }}
                                            onToggleLongPress={() => { }}
                                        />
                                    </View>
                                    <View style={styles.toggleSwitchText}>
                                        {this.renderLeaderboardText()}
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={{...styles.dropdownTile, ... {zIndex: 10, height: 85}}}>
                            <View style={styles.selectorTextView}>
                                <View style={{width:'40%',  justifyContent:'center'}}>
                                    <Text adjustsFontSizeToFit style={styles.createAccountText}>Institution:</Text>
                                </View>
                                <View style={{width:'60%', position: "relative", justifyContent:'center'}}>
                                    <DropDownPicker
                                        placeholder="Select..."
                                        open={institutionOpen}
                                        value={institutionValue}
                                        items={institutionItems}
                                        setOpen={this.setInstitutionOpen}
                                        setValue={this.setInstitutionValue}
                                        setItems={this.setInstitutionItems}
                                        dropDownDirection="DOWN"
                                        textStyle={{ fontSize: 16 }}
                                        containerProps={{width:'95%',height: 50}}
                                        style={{height:'90%', justifyContent:'center'}}
                                        dropDownContainerStyle={{ zIndex: 10, backgroundColor: "rgb(243,215,77)" }}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={{...styles.dropdownTile, ... {zIndex: 9, height: 255}}}>
                            <View style={styles.selectorTextView}>
                                <View style={{width:'40%', height: 85, justifyContent:'center'}}>
                                    <Text adjustsFontSizeToFit style={styles.createAccountText}>Team:</Text>
                                </View>
                                <View style={{width:'60%', height: 85, position: "relative", justifyContent:'center'}}>
                                    <DropDownPicker
                                        placeholder="Select..."
                                        open={teamOpen}
                                        value={teamValue}
                                        items={teamItems}
                                        setOpen={this.setTeamOpen}
                                        setValue={this.setTeamValue}
                                        setItems={this.setTeamItems}
                                        dropDownDirection="DOWN"
                                        textStyle={{ fontSize: 16 }}
                                        style={{height: 45, justifyContent:'center'}}
                                        containerProps={{width: "95%", height: "80%"}}
                                        dropDownContainerStyle={{zIndex: 9, backgroundColor: "rgb(243,215,77)" }}
                                    />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    <View style={styles.editButton}>
                        <TouchableOpacity onPress={() => this.createAccount()}>
                            <Text adjustsFontSizeToFit style={styles.editTextStyle}>Create Account</Text> 
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
            );
        }
    };

const styles = StyleSheet.create(
    {
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    header:{
        flex: 3,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    overallContent:{
        flex: 18,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'space-around',
    }, 
    content: {
        width:'100%',
        alignItems:'center'
    },
    menuButtomView:{
        justifyContent: 'center',
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
        width: '15%',
        height: '100%',
        padding: 2,
    },
    //menuButton is not supported
    menuButton:{
        marginVertical: 50,
        width: '95%',
        height: '90%',
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
    },
    headerSpace:{
        justifyContent: 'flex-start',
        alignSelf: 'flex-end',
        width: '57%',
        height: '100%',
    },
    title:{
        backgroundColor: 'rgb(50,100,25)',
        height:'6%',
        width: '85%',
        alignSelf: 'center',
        justifyContent:'center',
        borderRadius: 10,
        borderColor: 'black',
        borderWidth: 0.5, 
        marginBottom: '2%'
    },
    TitleTextStyle:{
        fontSize: 36,
        textAlign: 'center',
        fontWeight: 'bold',
        color:'white',
    },
    avoidingViewInfoTile:{
        width: '95%',
        height: 95,
        alignSelf: 'center',
    },
    dropdownTile:{
        width: '95%',
        minHeight: 85,
        alignSelf: 'center',
    },
    avoidingSpacingTile:{
        width: '95%',
        height: 40,
        alignSelf: 'center',
    },
    createAccountTextTile:{
        width: '100%',
        height:'55%',
        justifyContent :'center',
        padding:1,
    },
    createAccountText:{
        color: 'rgb(50,100,25)',
        fontWeight:'bold',
        fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 45,
    },
    displayTextInputView:{
        width:'100%',
        height:'45%',
        justifyContent:'center',
    },
    textBox: {
        backgroundColor: 'black',
        borderRadius: 7,
        color: 'white',
        fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 40,
        width: '100%',
        padding: 7,
        alignSelf:'center',
    },
    leaderboardTextTile:{
        width: '100%',
        height:'40%',
        justifyContent :'center',
    },
    leaderboardTextSmall:{
        color: 'rgb(50,100,25)',
        fontWeight:'bold',
        fontSize:27,
    },
    editInfoLeaderboards:{
        width: '95%',
        height:'40%',
        alignSelf: 'center',
    },
    leaderboardTile:{
        width: '100%',
        height:'100%',
        alignSelf: 'center',
    },
    toggleSwitchView:{
        width: '40%',
        height:'100%',
        justifyContent:'center',
        alignItems:'center',
    },
    switchAreaView:{
        width:'100%',
        height:'60%',
        flexDirection:'row',
        paddingTop: 10,
        justifyContent:'space-between'
    }, 
    toggleSwitchText:{
        alignItems:'center',
        justifyContent:'center',
        width: '40%',
        height:'100%',
    },
    toggleText:{
        fontSize:27,
        fontWeight:'bold'
    },
    editButton:{
        backgroundColor: 'rgb(243,215,77)',
        width: '75%',
        height: 50,
        justifyContent:'center',
        borderRadius: 9,
        alignItems:'center',
        alignSelf:'center',
        marginTop: '2%',
        marginBottom: '5%'
    },  
    editTextStyle:{
        fontSize: 30,
        textAlign: 'center',
    },
    selectorTextView:{
        height: '75%',
        width:'100%',
        flexDirection:'row',
    }, 
    });

export default CreateAccountScreen;

