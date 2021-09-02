import React, { Component }  from 'react';
import { View, Text, StyleSheet , Dimensions, Image, SafeAreaView, FlatList, TouchableOpacity} from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons'; 

const base = require('../helpers/base');
const nav = require('../helpers/navigation');
const api = require('../helpers/apiRoutes');

const PARAM_UPDATE_TIME = "updateTime";

class OpportunitiesScreen extends Component 
    {
    state = { 
        data: [] , 
        token: null, 
        lastUpdate: null,
        }
    
    constructor(props) { super(props); }

    async componentDidMount() 
        {
        await this.perfromPageInitalization();
        }

    async componentDidUpdate()
        {
        const updateTime = this.props.navigation.getParam(PARAM_UPDATE_TIME);
        if ((this.state.lastUpdate == null && updateTime != undefined) || (updateTime > this.state.lastUpdate))
            await this.perfromPageInitalization(); 
        }

    async perfromPageInitalization()
        {
        try 
            {
            const result = await base.isAuthenticated();

            if(result.authenticated)
                {
                // Get all the opportunities
                const oppBody = { oppID: -1 };
                const oppResponse = await base.apiCall(result.token, api.getOpportunityInfo.route, api.getOpportunityInfo.method, oppBody);

                // Get the opportunities the volunteer is signed up for
                const volBody = { vol_ID: 0 };
                const volResponse = await base.apiCall(result.token, api.getVolunteeringData.route, api.getVolunteeringData.method, volBody);

                if (oppResponse.success && volResponse.success)
                    {
                    // Re-arrange the volunteer information to place the signed up opportuntiies at the top
                    var oppInfo = this.arrangeOpportunityList(oppResponse.oppInfo, volResponse.volunteeringData);

                    this.setState({ token: result.token, data: oppInfo, lastUpdate: new Date() });
                    }
                else 
                    {
                    alert("Somerthing went wrong loading the page. Trying again");
                    this.props.navigation.navigate({routeName: nav.Opportunties, params: {message: "Please Sign In"}});
                    }
                }
            else
                {
                this.props.navigation.navigate({routeName: nav.signIn, params: {message: "Please Sign In"}});
                }
            }
        catch (error) { console.error(error); }
        }

    arrangeOpportunityList(oppData, volData)
        {
        var usedOppIds = [];
        var arrangedData = [];

        // Gather all the signed up opportunties
        for (var v = 0; v < volData.length; v++)
            {
            var array = this.customArrayContains(oppData, volData[v].opp_id);
            if (array.containsData)
                {
                var newOppItem = {...oppData[array.atIndex], ...{signedUp: true, vDataId: volData[v].id}};
                arrangedData.push(newOppItem);
                usedOppIds.push(volData[v].opp_id);
                }
            }

        // Add rest of opps to the list
        for (var o = 0; o < oppData.length; o++)
            {
            if (!usedOppIds.includes(oppData[o].id))
                {
                var dataItem = {...oppData[o], ...{signedUp: false, vDataId: null}};
                arrangedData.push(dataItem);
                }
            }

        return arrangedData;
        }

    customArrayContains(oppData, seekingId)
        {
        var rv = {containsData: false, atIndex: -1};
        for (var o = 0; o < oppData.length; o++)
            {
            if (oppData[o].id == seekingId)
                {
                rv.containsData = true;
                rv.atIndex = o;
                break;
                }
            }

        return rv;
        }
    _listEmptyComponent () 
        {
        return (
            <View style={{ height: '100%', justifyContent: 'center', alignSelf: 'center', }}>
                <Text adjustsFontSizeToFit style={{fontSize: 30, textAlign: 'center', color: 'black', fontWeight: 'bold'}}>
                    Uh Oh! You have no recorded events to show.
                </Text>
            </View>
            );
        }

    Card = ({ item }) => 
        {
        const time = new Date(item.starttime);
        var hours = time.getUTCHours();
        var minutes = time.getMinutes();
        var ampm = "am";

        if (hours > 12) { hours -= 12; ampm = "pm"; }
        else if (hours == 12) { ampm = "pm"}

        if (minutes == 0) { minutes = "00" }

        var output  = hours + ':' + minutes + " " + ampm;
        var date = time.toDateString();

        var cardColour = item.signedUp ? 'rgb(50,100,25)' : 'rgb(243,215,77)';

        return (
            <View style={styles.oppList} backgroundColor={cardColour}>
                <TouchableOpacity onPress={() => {this.props.navigation.navigate({routeName: nav.OpportuntyInfo, params: {id: item.id, vDataId: item.vDataId}} )}} >     
                    <View style={styles.oppList_row}>
                        <View style={styles.oppList_top_leftItem}>
                            <Text adjustsFontSizeToFit style={[styles.oppList_boldText, (item.signedUp ? styles.oppList_text_white : styles.oppList_text_black)]}>{item.title}</Text>
                        </View>
                        <View style={styles.oppList_top_rightItem}>
                            <Text adjustsFontSizeToFit style={[styles.oppList_text_info, (item.signedUp ? styles.oppList_text_white : styles.oppList_text_black)]}>Info</Text>
                        </View>
                    </View>
                    <View style={styles.oppList_row}>
                        <View style={styles.oppList_bottom_leftItem}>
                            <Text adjustsFontSizeToFit style={[styles.oppList_text, (item.signedUp ? styles.oppList_text_white : styles.oppList_text_black)]}>{output}</Text>
                        </View>
                        <View style={styles.oppList_bottom_rightItem}>
                            <Text adjustsFontSizeToFit style={[styles.oppList_text, (item.signedUp ? styles.oppList_text_white : styles.oppList_text_black)]}>{date}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        )};

    _renderOpportunities () 
        {
        return (
            <FlatList data={this.state.data} navigation={this.props.navigation} ListEmptyComponent={this._listEmptyComponent}
                renderItem={this.Card} keyExtractor={item => item.id.toString()} />
            )
        }

    render()
        {   
        return (
            <SafeAreaView style={styles.screen}>
                <View style={styles.header}>
                    <View style={styles.menuButtomView}>
                        <View style={styles.menuButtom}>
                            <Entypo  name="menu" size={42} color="green" onPress={() => { this.props.navigation.toggleDrawer();}}/>
                        </View>
                    </View>

                    <View style={styles.headerSpace}></View>

                    <View style={styles.imageView}>
                        <Image source={require("../assets/HOD_Logo.png")} style={styles.logo} />
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.title}>
                        <Text style={styles.TitleTextStyle} adjustsFontSizeToFit>Opportunities</Text>
                    </View>
                    <View style={styles.OpportunitiesList}>
                        {this._renderOpportunities()}
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
        width: '75%',
        alignSelf: 'center',
        justifyContent:'center',
        margin: '6%',
        borderRadius: 10,
        borderColor: 'black',
        borderWidth: 0.5
        },
    TitleTextStyle:{
        fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 50,
        textAlign: 'center',
        fontWeight: 'bold',
        color:'white',
        },
    OpportunitiesList:{
        flex: 12,
        width: '96%',
        alignSelf: 'center',
        },
    oppList:{
        backgroundColor: 'rgb(243,215,77)',
        width: '100%',
        alignSelf: 'center',
        justifyContent: 'center',
        margin: '1%',
        padding: 8,
        borderRadius: 7,
        borderColor: 'black',
        borderWidth: 0.5
        },
    oppList_row:{
        flexDirection:'row',
        width:'100%',
        justifyContent:'space-between'
        },
    oppList_top_leftItem: {
        alignSelf:'flex-start',
        width: "85%",
        height: 35,
    },
    oppList_top_rightItem: {
        alignSelf:'flex-end',
        width: "15%",
        height: 35,
    },
    oppList_bottom_leftItem: {
        alignSelf:'flex-start',
        width: "35%",
        height: 25,
    },
    oppList__bottom_rightItem: {
        alignSelf:'flex-end',
        width: "65%",
        height: 25,
    },
    oppList_boldText: {
        fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 35,
        fontWeight: 'bold'
    },
    oppList_text: {
        fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 35
    },
    oppList_text_info: {
        fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 35,
        textDecorationLine: 'underline',
        },
    oppList_text_white: {
        color: 'white'
        },
    oppList_text_black: {
        color: 'black'
        }
    });

export default OpportunitiesScreen;
