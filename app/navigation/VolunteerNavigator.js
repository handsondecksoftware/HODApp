import {createStackNavigator} from 'react-navigation-stack';
import { createAppContainer} from "react-navigation";
import { createDrawerNavigator } from 'react-navigation-drawer';
import OpportunitiesScreen from "../screens/OpportunitiesScreen";
import SignInScreen from '../screens/SignInScreen';
import AccountInfoScreen from '../screens/AccountInfoScreen';
import OpportunityInfoScreen from '../screens/OpportunityInfoScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import LeaderboardsScreen from '../screens/LeaderboardsScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';

import drawerContent from '../components/drawerContent';

const VolunteerDrawerNavigator = createDrawerNavigator(
  {
    Opportunities:OpportunitiesScreen,
    Leaderboards:LeaderboardsScreen,
    Statistics:StatisticsScreen,
    AccountInfo:AccountInfoScreen,
    drawerFlip:drawerContent,
  },
  {
    contentComponent: drawerContent,
    navigationOptions: {
      headerVisible: false,
      gestureEnabled: false,
    }
  },
);

const VolunteerStackNavigator = createStackNavigator(
  {
    drawer:VolunteerDrawerNavigator,
    Opportunities:OpportunitiesScreen,
    OpportunityInfo:OpportunityInfoScreen,
  },
  {
    header: null,
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
      gestureEnabled: false,
    }
  },
);
const AccountNavigator = createStackNavigator(
  {
    SignIn:SignInScreen,
    CreateAccount:CreateAccountScreen
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
      gestureEnabled: false
    }
   }
);
const SignInNavigator = createStackNavigator(
  {
    SignIn:SignInScreen,
    drawer:VolunteerDrawerNavigator,
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
      gestureEnabled: false,
    }
   }
);

const VolunteerNavigator = createStackNavigator(
  {
    SignIn:SignInNavigator,
    AccountInfo:AccountNavigator,
    drawer:VolunteerDrawerNavigator,
    VolunteerInfoNavigator:VolunteerStackNavigator
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
      gestureEnabled: false,
    }
   }
);

export default createAppContainer(VolunteerNavigator);
