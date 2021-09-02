import React, { Component } from 'react';
import { StackActions, NavigationActions } from 'react-navigation';
import { Text, View, StyleSheet, SafeAreaView, Dimensions, TouchableHighlight } from 'react-native'
import { AntDesign, Entypo } from '@expo/vector-icons'; 
import * as SecureStore from 'expo-secure-store';
const STORAGE_KEY='save_jwt'
const UPDATE_ACC_INFO='update_bool'
export default class drawerContent extends Component {

    async navigateToScreen(route){
        const navigateAction = NavigationActions.navigate({
            routeName: route
        });
        if(route=='SignIn'){
            try{
            await SecureStore.deleteItemAsync(STORAGE_KEY)
            await SecureStore.deleteItemAsync(UPDATE_ACC_INFO)
            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'SignIn' })],
              });
              this.props.navigation.dispatch(resetAction);
            }
            catch(e){

            }
        }
        else{
        this.props.navigation.dispatch(navigateAction);
        }
        
    }
    handleLogout(){
        () => {
            const navigateAction = NavigationActions.navigate({
                routeName: 'SignIn'
            });
            console.log('like')
            this.props.navigation.dispatch(navigateAction);
        }
    }

  render() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.flip}>
                    <Entypo  name="menu" size={42} color="white" onPress={() => { this.props.navigation.toggleDrawer();}}/>
                </View>
            </View>
            <View style={styles.screenContainer}>
            <TouchableHighlight underlayColor='rgb(153,153,0)' style={styles.screenStyle} onPress={()=>this.navigateToScreen('Opportunities')}>
                <Text adjustsFontSizeToFit style={styles.screenTextStyle}>Opportunities</Text>
            </TouchableHighlight>
            <TouchableHighlight underlayColor='rgb(153,153,0)' style={styles.screenStyle} onPress={()=>this.navigateToScreen('Leaderboards')}>
                <Text adjustsFontSizeToFit style={styles.screenTextStyle}>Leaderboards</Text>
            </TouchableHighlight>
            <TouchableHighlight underlayColor='rgb(153,153,0)' style={styles.screenStyle} onPress={()=>this.navigateToScreen('Statistics')}>
                <Text adjustsFontSizeToFit style={styles.screenTextStyle}>Statistics</Text>
            </TouchableHighlight>
            <TouchableHighlight underlayColor='rgb(153,153,0)' style={styles.screenStyle} onPress={()=>this.navigateToScreen('AccountInfo')}>
                <Text adjustsFontSizeToFit style={styles.screenTextStyle}>Account Info</Text>
            </TouchableHighlight>    
            </View>
            <View style={styles.footerContainer}>
            <TouchableHighlight underlayColor='rgb(153,153,0)' style={styles.logoutButton} onPress={()=>this.navigateToScreen('SignIn')}>
                <Text adjustsFontSizeToFit style={styles.logoutText}>Logout</Text>
            </TouchableHighlight>    
            </View>
        </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: 'rgb(50,100,25)',
        height: '100%'
    },
    headerContainer: {
        flexDirection:'row',
        height: Dimensions.get('window').height * 0.15,
        height: '15%',
        alignSelf:'flex-end',
    },
    footerContainer: {
        width:'90%',
        height:'15%',
        alignSelf:'flex-end',
        justifyContent:'flex-end',
    },
    flip:{
        justifyContent:'center'
    },
    logoutButton:{
        width:'50%',
        margin:'2%',
        padding: 5,
        backgroundColor:'rgb(243,215,77)',
        alignSelf:'flex-end',
        justifyContent:'center',
        borderRadius: 7,
    },
    logoutText:{
        fontSize:32,
        textAlign:'center',
    },
    screenContainer: { 
        paddingTop: 5,
        width: '100%',
        height: '70%'
    },
    screenStyle: {
        height: '14%',
        marginTop: '12%',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'rgb(243,215,77)',
        padding: 3,
        borderBottomRightRadius: 100 ,
        borderTopRightRadius: 100,
    },
    screenTextStyle:{
        fontSize: 30, //Dynamic doesn't seem to work. Makes it too large.
        marginLeft: 20, 
        textAlign: 'center',
        fontWeight: 'bold',
    },
    selectedTextStyle: {
        fontWeight: 'bold',
    },
    press: {
        width: '100%',
        height: '100%',
        backgroundColor: 'red',
    },
});