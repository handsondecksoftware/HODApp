import React, { Component, useState} from 'react';
import { View, Text, StyleSheet , Dimensions, Image, SafeAreaView, FlatList, Modal, LogBox} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';

const base = require('../helpers/base');
const nav = require('../helpers/navigation');
const api = require('../helpers/apiRoutes');

const PARAM_ID = "id";
const PARAM_VDATA_ID = "vDataId";

var renderVolunteerItem = ({ item }) => 
    {
    //({item.hours} hours) -- removed for now since all volunteers sign up for full opp
    return ( <Text style={styles.InfoMainText} adjustsFontSizeToFit>{item.name}</Text> );    
    };

class OpportunityInfoScreen extends Component 
    {
    state = { 
        data: [], 
        token: null, 
        volunteersList:[], 
        modalVisible: false,
        startTime: "",
        endTime: "",
        vDataId: null,
        }

    constructor(props) { super(props); }  

    setModalVisible(visible) { this.setState({modalVisible: visible}); }
    setTimePickerVisibility(visible){ this.setState({showTimePicker: visible, timePickerButtonVisibility: !visible}); }

    async componentDidMount() 
        {
        try 
            {
            const result = await base.isAuthenticated();

            if(result.authenticated)
                {
                const vDataId = this.props.navigation.getParam(PARAM_VDATA_ID);
                const body = { oppID: this.props.navigation.getParam(PARAM_ID) };
                const response = await base.apiCall(result.token, api.getOpportunityData.route, api.getOpportunityData.method, body);

                this.setState({ 
                    token: result.token, 
                    data: response.oppData, 
                    volunteersList: response.oppData.volunteers, 
                    startTime: this.getTime(new Date(response.oppData.starttime)), 
                    endTime: this.getTime(new Date(response.oppData.endtime)),
                    vDataId: vDataId,
                    volunteerSignedUp: vDataId != null
                    });
                }
            else
                {
                this.props.navigation.navigate({routeName: nav.signIn, params: {message: "Please Sign In"}});
                }

                LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
            }
        catch (error) { console.error(error); }
        }
        
    renderDate() { return (new Date(this.state.data.starttime)).toDateString(); }
    startTime() { return this.getTime(new Date(this.state.data.starttime)); }
    endTime() { return this.getTime(new Date(this.state.data.endtime)); }

    renderVolunteers()
        {
        var flatListData = this.state.volunteersList.map(v => ({ key: v.id.toString(), name: v.name, hours: v.num_hours }));
        return (
            <SafeAreaView>
                <FlatList data={flatListData} contentContainerStyle={{ flexGrow: 1 }} ListEmptyComponent={this._listEmptyComponent} 
                    renderItem={renderVolunteerItem} keyExtractor={(item) => item.key} />
            </SafeAreaView>
            )
        }

    _listEmptyComponent() 
        {
        return (
            <Text style={styles.InfoMainText} adjustsFontSizeToFit>Be the first to sign up!</Text>
            );
        }

    getTime(date)
        {
        var hrs = Number(date.toUTCString().slice(17, 19));
        var min = Number(date.toUTCString().slice(20, 22));
        var time = "";

        if (min < 10)
            min = "0" + min;
    
        if(hrs > 12)
            time = (hrs - 12) + ":" + min + "pm";
        else if(hrs == 12)
            time = hrs + ":" + min + "pm";
        else 
            time = hrs + ":" + min + "am";
            
        return time;  
        }

    async determineModalConfirmAction()
        {
        if (this.state.volunteerSignedUp)
            {
            await this.deleteSignUp();
            }
        else 
            {
            await this.confirmSignUp();
            }
        }

    async deleteSignUp()
        {
        try 
            {
            const result = await base.isAuthenticated();

            if(result.authenticated)
                {
                const body = {vdata_ID: this.state.vDataId};
                const response = await base.apiCall(result.token, api.deleteVolunteeringData.route, api.deleteVolunteeringData.method, body);

                if (response.success)
                    {
                    alert("Sign Up Deleted!");
                    this.props.navigation.navigate({routeName: nav.Opportunties, params: {updateTime: new Date()}});
                    }
                else 
                    {
                    alert("Hmm, something didn't go right. Please try again");
                    console.log("Error Code: " + response.errorcode);
                    }
                }
            else
                {
                this.props.navigation.navigate({routeName: nav.signIn, params: {message: "Please Sign In"}});
                }

                LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
            }
        catch (error) 
            { 
            alert("Something didn't go right. Please try again");
            console.error(error); 
            }  
        }

    async confirmSignUp() 
        {
        try 
            {
            const result = await base.isAuthenticated();

            if(result.authenticated)
                {
                const body = 
                    {
                    volunteeringData:
                        { 
                        id: null, 
                        vol_id: 0, 
                        opp_id: this.props.navigation.getParam(PARAM_ID), 
                        title: null, 
                        type: null, 
                        starttime: this.state.data.starttime, 
                        endtime: this.state.data.endtime, 
                        validated: null
                        }
                    };
                const response = await base.apiCall(result.token, api.addVolunteeringData.route, api.addVolunteeringData.method, body);

                if (response.success)
                    {
                    alert("Sign Up Confirmed!");
                    this.props.navigation.navigate({routeName: nav.Opportunties, params: {updateTime: new Date()}});
                    }
                else 
                    {
                    alert("Hmm, something didn't go right. Please try again");
                    console.log("Error Code: " + response.errorcode);
                    }
                }
            else
                {
                this.props.navigation.navigate({routeName: nav.signIn, params: {message: "Please Sign In"}});
                }

                LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
            }
        catch (error) 
            { 
            alert("Something didn't go right. Please try again");
            console.error(error); 
            }  
        }

    render()
        {  
        var actionBtnText = this.state.volunteerSignedUp ? "Uncommit" : "Sign Up";
        var modalTitle = this.state.volunteerSignedUp ? "Delete Sign Up" : "Confirm Sign Up";

        return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <View style={styles.menuButtomView}>
                    <MaterialCommunityIcons name="arrow-left" size={46} color="green" onPress={() => { this.props.navigation.goBack();}}/>
                </View>
                <View style={styles.headerSpace}></View>
                <View style={styles.imageView}>
                    <Image source={require("../assets/HOD_Logo.png")} style={styles.logo} />
                </View>
            </View>
            <View style={styles.content}>
                <ScrollView>
                    <View style={styles.title}>
                        <Text style={styles.TitleTextStyle} adjustsFontSizeToFit>{this.state.data.title}</Text>
                    </View>
                    <View style={styles.type}>
                        <Text style={styles.TitleTextStyle} adjustsFontSizeToFit>{this.state.data.type}</Text>
                    </View>

                    <View style={styles.ButtonsView}>
                        <View style={styles.signUp}>
                            <TouchableOpacity onPress={() => this.setModalVisible(true)}>
                                <Text adjustsFontSizeToFit style={styles.ButtonText}>{actionBtnText}</Text> 
                            </TouchableOpacity>
                        </View>
                        <View style={styles.Cancel}>
                            <TouchableOpacity onPress={() => { this.props.navigation.goBack();}}>
                                <Text adjustsFontSizeToFit style={styles.ButtonText}>Back</Text> 
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.dateInfo}>
                        <View style={styles.time}>
                            <View style={styles.StartTimeView}>
                                <View style={styles.centerWrapper}>
                                    <Text style={styles.InfoHeaderText} adjustsFontSizeToFit>Date: </Text>
                                </View>
                                <View style={styles.centerWrapper}>
                                    <Text style={styles.InfoMainText}>{this.renderDate()}</Text>
                                </View>
                            </View>
                            <View style={styles.EndTimeView}>
                                <View style={styles.timingStart}>
                                    <Text style={styles.InfoHeaderText} adjustsFontSizeToFit>Start: </Text>
                                    <View style={styles.centerWrapper}>
                                        <Text style={styles.InfoMainText} adjustsFontSizeToFit>{this.startTime()}</Text>
                                    </View>
                                </View>
                                <View style={styles.timingEnd}>
                                    <Text style={styles.InfoHeaderText} adjustsFontSizeToFit>End: </Text>
                                    <View style={styles.centerWrapper}>
                                        <Text style={styles.InfoMainText} adjustsFontSizeToFit>{this.endTime()}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.eventInfoTile}>
                        <View style={styles.eventInfoTitle}>
                            <Text style={styles.InfoHeaderText} adjustsFontSizeToFit>Description: </Text>
                        </View>
                        <View style={styles.eventInfoText}>
                            <Text style={styles.InfoMainText} adjustsFontSizeToFit>{this.state.data.description}</Text>
                        </View>
                    </View>

                    <View style={styles.eventInfoTile}>
                        <View style={styles.eventInfoTitle}>
                            <Text style={styles.InfoHeaderText} adjustsFontSizeToFit>Location: </Text>
                        </View>
                        <View style={styles.eventInfoText}>
                            <Text style={styles.InfoMainText} adjustsFontSizeToFit>{this.state.data.location}</Text>
                        </View>
                    </View>

                    <View style={styles.eventInfoTile}>
                        <View style={styles.eventInfoTitle}>
                            <Text style={styles.InfoHeaderText} adjustsFontSizeToFit>Coordinator Info: </Text>
                        </View>
                        <View style={styles.eventInfoText}>
                            <Text style={styles.InfoMainText} adjustsFontSizeToFit>{this.state.data.cordinatorname}</Text>
                            <Text style={styles.InfoMainText} adjustsFontSizeToFit>{this.state.data.cordinatoremail}</Text>
                            <Text style={styles.InfoMainText} adjustsFontSizeToFit>{this.state.data.cordinatorphone}</Text>
                        </View>
                    </View>
                    <View style={styles.eventInfoTile}>
                        <View style={styles.eventInfoTitle}>
                            <Text style={styles.InfoHeaderText} adjustsFontSizeToFit>Volunteers: </Text>
                        </View>
                        <View style={styles.eventInfoText}>
                            {this.renderVolunteers()}
                        </View>
                    </View>
                </ScrollView>

                <Modal animationType="slide" transparent={true} visible={this.state.modalVisible} onRequestClose={() => { this.setState({modalVisible: false}); }}>
                    <View style={styles.aboveModalView}>
                        <TouchableOpacity onPress={()=>this.setModalVisible(false)}>
                            <View style={styles.completeFill}></View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalView}>
                        <View style={styles.modalTitleView}>
                            <Text style={styles.modalHeaderTextStyle}>{modalTitle}</Text>
                        </View>
                        <View style={styles.modalContentView}>
                            <View style={styles.modalContentTextInputView}>
                                <View style={styles.modalContentInduvidualInputView}>
                                    <View style={styles.modalContentInduvidualInputDivider}>
                                        <Text style={styles.modalContentTextStyle} adjustsFontSizeToFit>Title: </Text>
                                    </View>
                                    <View style={styles.modalContentInduvidualInputDividerLarge}>
                                        <View style={styles.fitModalText}>
                                            <Text style={styles.modalMainText} adjustsFontSizeToFit>{this.state.data.title}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.modalContentInduvidualInputView}>
                                    <View style={styles.modalContentInduvidualInputDivider}>
                                        <Text style={styles.modalContentTextStyle} adjustsFontSizeToFit>Date: </Text>
                                    </View>
                                    <View style={styles.modalContentInduvidualInputDividerLarge}>
                                        <View style={styles.fitModalText}>
                                            <Text style={styles.modalMainText}>{this.renderDate()}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.modalContentInduvidualInputView}>
                                    <View style={styles.modalContentInduvidualInputDivider}>
                                        <Text style={styles.modalContentTextStyle} adjustsFontSizeToFit>Start At: </Text>
                                    </View>
                                    <View style={styles.modalContentInduvidualInputDividerLarge}>
                                        <Text style={styles.modalMainText}>{this.state.startTime}</Text>
                                    </View>
                                </View>
                                <View style={styles.modalContentInduvidualInputView}>
                                    <View style={styles.modalContentInduvidualInputDivider}>
                                        <Text style={styles.modalContentTextStyle} adjustsFontSizeToFit>End At: </Text>
                                    </View>
                                    <View style={styles.modalContentInduvidualInputDividerLarge}>
                                        <Text style={styles.modalMainText}>{this.state.endTime}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.modalContentButtonView}>
                                <View style={styles.modalButton}>
                                    <Text onPress={()=>this.setModalVisible(false)} adjustsFontSizeToFit style={styles.editTextStyle}>Cancel</Text> 
                                </View>
                                <View style={styles.modalButton}>
                                    <Text onPress={() => this.determineModalConfirmAction()} adjustsFontSizeToFit style={styles.editTextStyle}>Confirm</Text> 
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
        );
        }
    };
/*
    onTimePickerChange = (event, selectedDate) => 
        {
        const currentDate = selectedDate || this.state.startTimePicked;
        var newTitle = this.getTime(currentDate) + " - Change";
        this.setState({ showTimePicker: false, startTimePicked: currentDate, startTimeTitle: newTitle });
        };
    <DateTimePicker
        style={styles.timePickerCenter}
        value={this.state.startTimePicked}
        mode={'time'}
        is24Hour={true}
        display={Platform.OS == 'ios' ? "spinner" : "spinner"}
        onChange={(e, d) => { this.onTimePickerChange(e,d); }}
    />
    {!this.state.showTimePicker && (
        <Button onPress={() => this.setTimePickerVisibility(true)} title={this.state.startTimeTitle} />
    )}
    {this.state.showTimePicker && (
        <DropDownPicker
            placeholder="Hour"
            open={teamOpen}
            value={teamValue}
            items={teamItems}
            setOpen={this.setTeamOpen}
            setValue={this.setTeamValue}
            setItems={this.setTeamItems}
            dropDownDirection="DOWN"
            textStyle={{ fontSize: 16 }}
            containerProps={{width:'45%',height:'80%'}}
            style={{height:'90%', justifyContent:'center'}}
            onChangeValue={(value) => { }}
            dropDownContainerStyle={{ backgroundColor: "white" }}
        />
    )}
*/
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
    content:{
        flex: 18,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'space-around',
        },
    menuButtomView:{
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
        },
    headerSpace:{
        justifyContent: 'flex-start',
        alignSelf: 'flex-end',
        width: '57%',
        height: '100%',
        },
    title:{
        flex: 1,
        backgroundColor: 'rgb(50,100,25)',
        width: '95%',
        alignSelf: 'center',
        justifyContent:'center',
        marginTop: '6%',
        borderRadius: 9,
        borderColor: 'black',
        borderWidth: 0.5
        },
    type:{
        flex: 1,
        backgroundColor: 'rgb(50,100,25)',
        width: '95%',
        alignSelf: 'center',
        justifyContent:'center',
        marginTop: '5%',
        borderRadius: 9,
        borderColor: 'black',
        borderWidth: 0.5
        },
    ButtonsView:{
        flex: 1.2,
        flexDirection: 'row',
        width: '95%',
        alignSelf: 'center',
        justifyContent:'space-between',
        marginTop: '5%',
        },
    signUp:{
        backgroundColor: 'rgb(243,215,77)',
        width: '53%',
        height:'100%',
        justifyContent:'center',
        borderRadius: 9,
        borderColor: 'black',
        borderWidth: 0.5
        },
    Cancel:{
        backgroundColor: 'rgb(243,215,77)',
        width: '45%',
        height:'100%',
        justifyContent:'center',
        borderRadius: 9,
        borderColor: 'black',
        borderWidth: 0.5
        },
    dateInfo:{
        width: '95%',
        alignSelf: 'center',
        justifyContent:'center',
        marginTop: '5%',
        borderRadius: 9,
        borderColor: 'rgb(50,100,25)',
        borderWidth: 1.7
        },
    time:{
        width: '97%',
        margin: "2%",
        },
    StartTimeView:{
        flexDirection:'row',
        },
    centerWrapper:{
        flexDirection:'row',
        alignSelf: 'center',

        },
    EndTimeView:{
        flexDirection:'row',
        marginTop: "1%",
        },
    timingStart:{
        flexDirection:'row',
        width:'47%',
        marginRight: '3%'
        },
    timingEnd:{
        flexDirection:'row',
        width:'47%',
        marginLeft: '3%'
        },
    eventInfoTile:{
        width: '95%',
        alignSelf: 'center',
        justifyContent:'center',
        marginTop: '2%',
        borderRadius: 9,
        borderColor: 'rgb(50,100,25)',
        borderWidth: 1.7,
        },
    eventInfoTitle:{
        marginTop: "2%",
        marginHorizontal: "2%",
        },
    eventInfoText:{
        marginBottom: "1%",
        marginHorizontal: "2%",
        },
    TitleTextStyle:{
        fontSize: 30,
        textAlign: 'center',
        fontWeight: 'bold',
        color:'white',
        },
    ButtonText:{
        fontSize: 30,
        textAlign: 'center',
        color:'black',
        },
    InfoHeaderText:{
        fontSize: 25,
        fontWeight: 'bold',
        color:'rgb(50,100,25)',
        },
    InfoMainText:{
        fontSize: 22,
        color:'black',
        },
    modalView:{
        height:'50%',
        width:'100%',
        alignSelf:'center',
        backgroundColor: 'rgba(0,0,0,.5)',
        },
    aboveModalView:{
        height:'50%',
        width:'100%',
        backgroundColor: 'rgba(0,0,0,.5)',
        },
    completeFill:{
        height:'100%',
        width:'100%',
        },
    modalTitleView:{
        height:'15%',
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
        fontSize:26,
        fontWeight:'500'
        },
    modalMainText:{
        fontSize: 24,
        color:'black',
        },
    fitModalText:{
        height:'100%',
        width:'100%',
        alignItems:'flex-start',
        justifyContent:'center',
        },
    modalContentView:{
        height:'85%',
        width:'100%',
        backgroundColor:'white',
        justifyContent:'center',
        borderColor:'black',
        borderLeftWidth:1,
        borderRightWidth:1,
        },
    modalContentTextInputView:{
        height:'75%',
        width:'100%',
        alignItems:'center',
        backgroundColor:'white',
        },
    modalContentButtonView:{
        height:'25%',
        width:'100%',
        flexDirection:'row',
        justifyContent:'space-around',
        backgroundColor:'white',
        },
    modalContentInduvidualInputView:{
        height:'25%',
        width:'100%',
        flexDirection:'row',
        backgroundColor:'white',
        },
    modalContentInduvidualInputDivider:{
        padding:'1%',
        height:'100%',
        width:'40%',
        justifyContent:'center',
        },
    modalContentInduvidualInputDividerLarge:{
        height:'100%',
        width:'59%',
        justifyContent:'center',
        },
    timePickerCenter:{
        justifyContent: 'center'
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
    editTextStyle:{
        fontSize: 30,
        textAlign: 'center',
        },
    });

export default OpportunityInfoScreen;
