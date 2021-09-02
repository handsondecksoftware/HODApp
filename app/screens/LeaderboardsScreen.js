import React, { Component }  from 'react';
import { View, Text, StyleSheet , Dimensions, Image, SafeAreaView, TouchableOpacity, FlatList} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const base = require('../helpers/base');
const nav = require('../helpers/navigation');
const api = require('../helpers/apiRoutes');

const activeColour = "rgb(243,215,77)";
const activeTextColour = "black";
const inactiveColour = "rgb(50,100,25)";
const inactiveTextColour = "white";

var TeamButtonColour = activeColour;
var TeamButtonTextColour = activeTextColour;
var IndividualButtonColour = inactiveColour;
var IndividualButtonTextColour = inactiveTextColour;

const teamSTATE = "team";
const volunteerSTATE = "volunteer";

var Item = ({ id, Name, NumberOfHours}) => 
    (
    <View style={styles.leaderTile}>
        <View style={styles.Tile_Info_Left}>
            <Text adjustsFontSizeToFit style={styles.leaderNameText}>{id}.  {Name}</Text>
        </View>
        <View style={styles.Tile_Info_Right}>
            <Text adjustsFontSizeToFit style={styles.leaderInfoText}>Hours: {NumberOfHours}</Text>
        </View>
    </View>
    );

var renderTeamItem = ({ item }) => 
    {
    return ( <Item id={item.rank.toString()} Name={item.teamname} NumberOfHours={item.numhours}/> );
    };

var renderVolunteerItem = ({ item }) => 
    {
    return ( <Item id={item.rank} Name={item.name} NumberOfHours={item.numhours}/> );
    };

class LeaderboardsScreen extends Component 
    {
    state = { 
        token: null,
        team_data: null, 
        volunteer_data: null, 
        TeamTextColor: 'blue', 
        button: teamSTATE
        }
    
    async componentDidMount() { await this.updateLeaderboards(); }

    async updateLeaderboards()
        {
        try 
            {
            const result = await base.isAuthenticated();

            if(result.authenticated)
                {
                this.state.token = result.token;

                const team_json = await base.apiCall(this.state.token, api.getTeamLeaderboard.route, api.getTeamLeaderboard.method);
                const volunteer_json = await base.apiCall(this.state.token, api.getVolunteerLeaderboard.route, api.getVolunteerLeaderboard.method);

                this.setState({ team_data: team_json.teamLeader, volunteer_data: volunteer_json.volunteerLeader });
                }
            else
                {
                this.props.navigation.navigate({routeName: nav.signIn, params: {message: "Please Sign In"}});
                }
            }
        catch (error) { console.error(error); }
        }

    renderBoards()
        {
        if(this.state.button == teamSTATE) { return this.renderTeams(); }
        else { return this.renderInd(); }
        }

    async pressTeams()
        {
        TeamButtonColour = activeColour;
        TeamButtonTextColour = activeTextColour;
        IndividualButtonColour = inactiveColour;
        IndividualButtonTextColour = inactiveTextColour;
        this.setState({ button: teamSTATE});

        await this.updateLeaderboards()
        }

    renderTeams()
        {
        return(
            <View style={styles.LeaderboardView}>
                <FlatList  data={this.state.team_data} contentContainerStyle={{ flexGrow: 1 }} ListEmptyComponent={this._listEmptyComponent}
                    renderItem={renderTeamItem} keyExtractor={(item) => item.rank.toString()} />
            </View>
            )
        }

    async pressInd()
        {
        TeamButtonColour = inactiveColour;
        TeamButtonTextColour = inactiveTextColour;
        IndividualButtonColour = activeColour;
        IndividualButtonTextColour = activeTextColour;
        this.setState({ button: volunteerSTATE});

        await this.updateLeaderboards();
        }

    renderInd()
        {
        return(
            <View style={styles.LeaderboardView}>
                <FlatList  data={this.state.volunteer_data} contentContainerStyle={{ flexGrow: 1 }} ListEmptyComponent={this._listEmptyComponent}
                    renderItem={renderVolunteerItem} keyExtractor={(item) => item.rank.toString()} />
            </View>
            )
        }

    _listEmptyComponent () 
        {
        return (
            <View style={styles.emptyListView}>
                <Text adjustsFontSizeToFit style={styles.emptyListText}>There are no leaderboards to show. Visit the opportunities page to volunteer now!</Text>
            </View>
            );
        }

    render()
        {
        return (
            <SafeAreaView style={styles.screen}>
                <View style={styles.header}>
                    <View style={styles.menuButtomView}>
                        <View style={styles.menuButtom}>
                            <MaterialCommunityIcons  name="menu" size={42} color="green" onPress={() => {this.props.navigation.toggleDrawer();}}/>
                        </View>
                    </View>
                    <View style={styles.headerSpace}></View>
                    <View style={styles.imageView}>
                        <Image source={require("../assets/HOD_Logo.png")} style={styles.logo} />
                    </View>
                </View>
                <View style={styles.content}>
                    <View style={styles.title}>
                        <Text style={styles.TitleTextStyle} adjustsFontSizeToFit>Leaderboards</Text>
                    </View>

                    <View style={styles.ButtonsView}>
                        <View style={styles.TeamButton} backgroundColor={TeamButtonColour}>
                            <TouchableOpacity onPress={() => {this.pressTeams();}}>
                                <Text adjustsFontSizeToFit style={{fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 50,
                                                                    textAlign: 'center', color: TeamButtonTextColour, fontWeight: 'bold'}}>
                                    Team
                                </Text> 
                            </TouchableOpacity>
                        </View>
                        <View style={styles.IndividualButton} backgroundColor={IndividualButtonColour}>
                            <TouchableOpacity onPress={() => {this.pressInd();}}>
                                <Text adjustsFontSizeToFit style={{ fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 50,
                                                                    textAlign: 'center', color: IndividualButtonTextColour, fontWeight: 'bold'}}>
                                    Individual
                                </Text>          
                            </TouchableOpacity>
                        </View>
                    </View>

                    {this.renderBoards()}

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
        flex: 1,
        backgroundColor: 'rgb(50,100,25)',
        width: '75%',
        alignSelf: 'center',
        justifyContent:'center',
        marginTop: '6%',
        marginHorizontal: '7%',
        marginBottom: '1%',
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
    LeaderboardView:{
        flex: 12,
        width: '96%',
        alignSelf: 'center',
        },
    ButtonsView:{
        flex: 1,
        flexDirection: 'row',
        width: '95%',
        alignSelf: 'center',
        justifyContent:'space-between',
        margin: '1%',
        },
    TeamButton:{
        width: '45%',
        height:'100%',
        justifyContent:'center',
        borderRadius: 9,
        borderColor: 'black',
        borderWidth: 0.5
        },
    IndividualButton:{
        width: '45%',
        height:'100%',
        justifyContent:'center',
        borderRadius: 9,
        borderColor: 'black',
        borderWidth: 0.5
        },
    emptyListView: {
        height: '100%', 
        justifyContent: 'center', 
        alignSelf: 'center'
        },
    emptyListText: {
        fontSize: 30, 
        textAlign: 'center', 
        color: 'black', 
        fontWeight: 'bold'
        },
    leaderNameText:{
        fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 40,
        textAlign: 'left',
        marginLeft: '3%',
        marginTop: '3%',
        marginBottom: '0.7%',
        fontWeight: 'bold',
        color:'black',
        padding: 1,
        },
    leaderInfoText:{
        fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 40,
        textAlign: 'left',
        marginLeft: '3%',
        marginTop: '3%',
        marginBottom: '0.7%',
        fontWeight: 'bold',
        color:'black',
        padding: 1,
        },
    leaderTile:{
        backgroundColor: 'rgb(243,215,77)',
        flexDirection:'row',
        width: '100%',
        alignSelf: 'center',
        justifyContent:'space-between',
        margin: '1%',
        borderRadius: 7,
        borderColor: 'black',
        borderWidth: 0.5
        },
    Tile_Info_Left:{
        alignSelf:'flex-start',
        width: "70%",
        height: 40,
        },
    Tile_Info_Right:{
        alignSelf:'flex-start',
        width: "30%",
        height: 40,
        },
    });

export default LeaderboardsScreen;

