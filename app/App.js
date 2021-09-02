import React from 'react';
import { enableScreens } from 'react-native-screens';

import  VolunteerNavigator from './navigation/VolunteerNavigator';

enableScreens();

export default function App() 
    {
    return <VolunteerNavigator />;
    }