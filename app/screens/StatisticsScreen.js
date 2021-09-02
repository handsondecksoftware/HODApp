import React, { Component }  from 'react';
import { View, Text, StyleSheet , Dimensions, Image, SafeAreaView, TouchableOpacity, FlatList} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { PieChart } from "react-native-chart-kit";

const base = require('../helpers/base');
const nav = require('../helpers/navigation');
const api = require('../helpers/apiRoutes');

const OVERVIEW_BTN = "OVERVIEW";
const HISTORY_BTN = "HISTORY";

const colorLibrary = ["#00876c", "#F7E29D", "#9fd184",  "#72b97c", "#45a074",  "#d43d51", "#fab560", "#fedb79", "#f38f52", "#cee98f",  "#e7674e"];

const inactiveColour = "rgb(243,215,77)";
const inactiveTextColour = "black";
const activeColour = "rgb(50,100,25)";
const activeTextColour = "white";

var OverviewButtonColor = inactiveColour;
var HistoryButtonColor = activeColour;
var OverviewTextColor = inactiveTextColour;
var HistoryTextColor = activeTextColour;

var Item = ({ id, Title, Hours, Date, Type, Upcoming}) => 
    (   
    <View style={styles.historyTile} backgroundColor={Upcoming ? 'rgb(50,100,25)' : 'rgb(243,215,77)'}>
        <View style={styles.historyTile_row}>
            <View style={styles.historyTile_leftItem}><Text adjustsFontSizeToFit style={[styles.historyTile_text, (Upcoming ? styles.historyTile_text_white : styles.historyTile_text_black)]}>{Date}</Text></View>     
            <View style={styles.historyTile_rightItem}>
                <Text adjustsFontSizeToFit style={[styles.historyTile_text, (Upcoming ? styles.historyTile_text_white : styles.historyTile_text_black)]}>
                    <Text style={styles.boldText}>Hours: </Text><Text>{Hours}</Text>
                </Text>
                </View>
        </View>
        <View style={styles.historyTile_row}>
            <View style={styles.historyTile_leftItem}>
                <Text adjustsFontSizeToFit style={[styles.historyTile_text, (Upcoming ? styles.historyTile_text_white : styles.historyTile_text_black)]}>
                    <Text style={styles.boldText}>Event: </Text><Text>{Title}</Text>
                </Text>
            </View>     
            <View style={styles.historyTile_rightItem}><Text adjustsFontSizeToFit style={[styles.historyTile_text, styles.boldText, (Upcoming ? styles.historyTile_text_white : styles.historyTile_text_black)]}>{Type}</Text></View>
        </View>
    </View>
    );

var renderItem =  ({ item })  => 
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

    var displayDate = starttime.toDateString().slice(0, 10);
    var displayHours = hour_duration + minute_duration;

    const now = new Date();

    if (starttime <= now)
        return ( <Item id={item.id} Title={item.title} Hours={displayHours} Date={displayDate} Type={item.type} Upcoming={false}/> );
    else 
        return ( <Item id={item.id} Title={item.title} Hours={displayHours} Date={displayDate} Type={item.type} Upcoming={true}/> );
    };

class StatisticsScreen extends Component {
    state = { 
        data: [] ,
        token: null,
        volunteer: '', 
        OverviewTextColor: 'blue', 
        button: OVERVIEW_BTN,
        }

    async componentDidMount()
        {
        try 
            {
            const result = await base.isAuthenticated();

            if(result.authenticated)
                {
                this.state.token = result.token;

                var body = { vol_ID : 0 };
                const response = await base.apiCall(this.state.token, api.getVolunteerData.route, api.getVolunteerData.method, body);

                this.setState({ data: response.volunteerData.volunteeringdata, volunteer: response.volunteerData});
                }
            else
                {
                this.props.navigation.navigate({routeName: nav.signIn, params: {message: "Please Sign In"}});
                }
            }
        catch (error) { console.error(error); }
        }

    renderHistory()
        {
        return(
            <View style={styles.StatisticsView}>
                <FlatList data={this.state.data} contentContainerStyle={{ flexGrow: 1 }} ListEmptyComponent={this._listEmptyComponent}
                    renderItem={renderItem} keyExtractor={(item) => item.id.toString()} />
            </View>
            )
        }

    calculateTotalHours()
        {
        var total_hours = 0;

        this.state.data.map((item, id) => 
            {
            const today = new Date();
            const eventDate = new Date(item.starttime);
            if (eventDate <= today)
                total_hours += base.computeDuration(item);
            });

        return ( <Text>{(total_hours.toFixed(1))}</Text> );
        }

    calculateLastMonthHours()
        {
        var month_hours = 0;

        this.state.data.map((item, id) => 
            {
            // Set cutoff date as 30 days ago
            const today = new Date();
            const cutoffDate = new Date().setDate(today.getDate() - 30);
            const eventDate = new Date(item.starttime);

            if((eventDate > cutoffDate) && (eventDate <= today))
                month_hours += base.computeDuration(item);
            });

        return ( <Text>{(month_hours.toFixed(1))}</Text> );
        }

    renderOverview()
        {
        const screen_width = Dimensions.get('window').width;
        const screen_height = (Dimensions.get('window').height) * 0.3;
        var events = this.state.data.filter(item => { return ((new Date(item.starttime)) <= (new Date())) });

        if (events != undefined && events.length < 1)
            events = [{ type: "None", starttime: new Date("2021-01-01T10:00:00.000Z"), endtime: new Date("2021-01-01T11:00:00.000Z") }];

        var itemNumber = 0;
        var maxColors = 12;
        //https://stackoverflow.com/questions/61939507/how-to-group-an-array-within-react-native
        let grouped_events = Object.values(events.reduce((chart_data, item) => 
            {
            if (!chart_data[item.type]) 
                chart_data[item.type] = 
                    {
                    name: item.type,
                    duration: 0, 
                    color: colorLibrary[(itemNumber++) % maxColors], 
                    legendFontColor: 'black', 
                    legendFontSize: 17
                    };

            chart_data[item.type].duration += base.computeDuration(item);

            return chart_data;
            }, {}))

        const chartConfig = 
            {
            backgroundGradientFrom: '#1E2923',
            backgroundGradientTo: '#08130D',
            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,   //Has to be a function for some reason
            strokeWidth: 2 // optional, default 3
            }

        return (
            <SafeAreaView style={styles.StatisticsView}>
                <View style={styles.hourStats}>
                    <View style={styles.TotalHours}>
                        <View style={styles.TotalHoursText}>
                            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.TotalHoursTextStyle}>Total Hours</Text>
                        </View>
                        <View style={styles.TotalHoursNumber}>
                            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.TotalHoursNumberStyle}>{this.calculateTotalHours()}</Text>
                        </View>
                    </View>
                    <View style={styles.TotalHours}>
                        <View style={styles.TotalHoursText}>
                            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.TotalHoursTextStyle}>Last Month</Text>
                        </View>
                        <View style={styles.TotalHoursNumber}>
                            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.TotalHoursNumberStyle}>{this.calculateLastMonthHours()}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.pieView}>
                    <PieChart
                        data={grouped_events}
                        width={screen_width}
                        height={screen_height}
                        chartConfig={chartConfig}
                        accessor="duration"
                        backgroundColor="transparent"
                        paddingLeft="10"
                        paddingTop="50"
                        paddingRight="30"
                        absolute
                    />
                </View>
            </SafeAreaView>
            )
        }

    renderStats()
        {
        if(this.state.button == OVERVIEW_BTN) { return(this.renderOverview()); }
        if(this.state.button == HISTORY_BTN){ return(this.renderHistory()); }
        }

    pressOverview()
        {
        OverviewButtonColor = inactiveColour;
        HistoryButtonColor = activeColour;
        OverviewTextColor = inactiveTextColour;
        HistoryTextColor = activeTextColour;
        this.setState({button: OVERVIEW_BTN});
        }

    pressHistory()
        {
        HistoryButtonColor = inactiveColour;
        OverviewButtonColor = activeColour;
        OverviewTextColor = activeTextColour;
        HistoryTextColor = inactiveTextColour;
        this.setState({button: HISTORY_BTN});
        }

    _listEmptyComponent() 
        {
        return (
            <View style={{ height: '100%', justifyContent: 'center', alignSelf: 'center', }}>
                <Text adjustsFontSizeToFit style={{ fontSize: 30, textAlign: 'center', color: 'black', fontWeight: 'bold', }}>
                    Uh Oh! You have no recorded events to show.
                </Text>
            </View>
            );
        }

    render()
        {
        return (
            <SafeAreaView style={styles.screen}>
                <View style={styles.header}>
                    <View style={styles.menuButtonView}>
                        <View>
                            <MaterialCommunityIcons  name="menu" size={42} color="green" onPress={() => { this.props.navigation.toggleDrawer();}}/>
                        </View>
                    </View>
                    <View style={styles.headerSpace}></View>
                    <View style={styles.imageView}>
                        <Image source={require("../assets/HOD_Logo.png")} style={styles.logo} />
                    </View>
                </View>
                <View style={styles.content}>

                    <View style={styles.title}>
                        <Text style={styles.TitleTextStyle} adjustsFontSizeToFit>Statistics</Text>
                    </View>
                    <View style={styles.userName}>
                        <Text style={styles.TitleTextStyle} adjustsFontSizeToFit>{this.state.volunteer.name}</Text>
                    </View>

                    <View style={styles.ButtonsView}>
                        <View style={styles.OverviewButton} backgroundColor={OverviewButtonColor}>
                            <TouchableOpacity onPress={() => {this.pressOverview();}}>
                                <Text adjustsFontSizeToFit style={{ fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 40, 
                                                                    textAlign: 'center', color: OverviewTextColor, fontWeight: 'bold', }}>
                                    Overview
                                </Text> 
                            </TouchableOpacity>
                        </View>
                        <View style={styles.HistoryButton} backgroundColor={HistoryButtonColor}>
                            <TouchableOpacity onPress={() => {this.pressHistory();}}>
                                <Text adjustsFontSizeToFit style={{ fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 40, 
                                                                    textAlign: 'center', color: HistoryTextColor, fontWeight: 'bold', }}>
                                    History
                                </Text>          
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    {this.renderStats()}
                
                </View>
            </SafeAreaView>
            );
        }
    };

const styles = StyleSheet.create({
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
    justifyContent: 'flex-start',
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
  },
  headerSpace:{
    justifyContent: 'flex-start',
    alignSelf: 'flex-end',
    width: '57%',
    height: '100%',
  },
  title:{
    backgroundColor: 'rgb(50,100,25)',
    width: '94%',
    height:'8%',
    alignSelf: 'center',
    justifyContent:'center',
    marginTop: '6%',
    marginHorizontal: '7%',
    marginBottom: '1%',
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 0.5,
    padding:3
  },
  userName:{
    backgroundColor: 'rgb(50,100,25)',
    width: '94%',
    height:'8%',
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
  boldText: {
      fontWeight: 'bold'
  },
  TitleTextStyle:{
    fontSize: ((Dimensions.get('window').width) / (Dimensions.get('window').height)) * 50,
    textAlign: 'center',
    fontWeight: 'bold',
    color:'white',
  },
  StatisticsView:{
    flex: 12,
    width: '94%',
    alignSelf: 'center',
  },
  ButtonsView:{
    flexDirection: 'row',
    width: '94%',
    height:'9%',
    alignSelf: 'center',
    justifyContent:'space-between',
    marginBottom: '2%',
    marginTop: '1%'
  },
  OverviewButton:{
    width: '48%',
    height:'100%',
    justifyContent:'center',
    borderRadius: 9,
    borderColor: 'black',
    borderWidth: 0.5
  },
  HistoryButton:{
    backgroundColor: HistoryButtonColor,
    width: '48%',
    height:'100%',
    justifyContent:'center',
    borderRadius: 9,
    borderColor: 'black',
    borderWidth: 0.5
  },
  historyTile:{
    width: '100%',
    marginVertical: '1%',
    borderRadius: 7,
    borderColor: 'black',
    borderWidth: 0.5
  },
  historyTile_row:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginRight: '3%',
    marginLeft:'1%',
    marginVertical:'1%',
  },
  historyTile_leftItem:{
    alignSelf:'flex-start',
    width:'75%',
  },
  historyTile_rightItem:{
    alignItems:'flex-end',
    width:'25%',
  },
  historyTile_text: {
    textAlign: 'left',
    marginLeft: '3%',
    marginTop: '0.6%',
    marginBottom: '0.7%',
    color:'black',
    padding: 1,
  },
    historyTile_text_white: {
        color: 'white'
    },
    historyTile_text_black: {
        color: 'black'
    },
  hourStats:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    height:'20%',
    marginTop:4,
  },
  TotalHours:{
    width:'48%',
    height:'100%',
    justifyContent:'flex-start',
    borderRadius: 9,
    borderColor: 'rgb(50,100,25)',
    borderWidth: 1.7,
    padding:5
  },
  TotalHoursText:{
      height:'50%',
      alignItems:'center',
  },
  TotalHoursNumber:{
    height:'50%',
    alignItems:'center',
  },
  TotalHoursTextStyle:{
    fontSize: 36,
    color:'rgb(50,100,25)',
  },
  TotalHoursNumberStyle:{
    fontSize: 36,
    color:'black',
  },
  pieView:{
    height:'79%',
    width:'100%',
    justifyContent:'center',
  },
});

export default StatisticsScreen;

