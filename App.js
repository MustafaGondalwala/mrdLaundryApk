import React, {Fragment} from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { fromRight } from 'react-navigation-transitions';
import Icon from 'react-native-vector-icons/Ionicons';
import * as colors from './src/assets/css/Colors';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import strings from "./src/languages/strings.js";

//Screens
import Product from './src/views/Product';
import Address from './src/views/Address';
import AddressList from './src/views/AddressList';
import Cart from './src/views/Cart';
import Faq from './src/views/Faq';
import FaqDetails from './src/views/FaqDetails';
import Forgot from './src/views/Forgot';
import Home from './src/views/Home';
import Login from './src/views/Login';
import Logout from './src/views/Logout';
import More from './src/views/More'; 
import MyOrders from './src/views/MyOrders';
import OrderDetails from './src/views/OrderDetails';
import Otp from './src/views/Otp';
import OtpLogin from "./src/views/OtpLogin";
import AppDemo from "./src/views/AppDemo";
import Payment from './src/views/Payment';
import PrivacyPolicy from './src/views/PrivacyPolicy';
import Profile from './src/views/Profile';
import Promo from './src/views/Promo';
import Register from './src/views/Register';
import Reset from './src/views/Reset';
import Splash from './src/views/Splash';
import ChangeLanguage from "./src/views/ChangeLanguage"
import Feedback from "./src/views/Feedback"
import PickUpDelivery from "./src/views/PickUpDelivery"


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


function MyTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      animationEnabled={true}
      tabBarOptions={{
        activeTintColor: '#FFFFFF',
        inactiveTintColor: '#bfbfbf',
        style:{
          backgroundColor: '#115e7a',
        }
      }}

    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: strings.home,
          tabBarIcon: ({ color, size }) => (
            <Icon name='ios-home' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MyOrders"
        component={MyOrders}
        options={{
          tabBarLabel: strings.my_orders,
          tabBarIcon: ({ color, size }) => (
            <Icon name='ios-shirt' color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="More"
        component={More}
        options={{
          tabBarLabel: strings.more,
          tabBarIcon: ({ color, size }) => (
            <Icon name='ios-more' color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}


function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode="none" initialRouteName="Splash" >
      <Stack.Screen name="Address" component={Address} />
      <Stack.Screen name="AddressList" component={AddressList} />
      <Stack.Screen name="Cart" component={Cart} />
      <Stack.Screen name="Faq" component={Faq} />
      <Stack.Screen name="FaqDetails" component={FaqDetails} />
      <Stack.Screen name="Forgot" component={Forgot} />
      <Stack.Screen name="Home" component={MyTabs} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="OtpLogin" component={OtpLogin} />

      <Stack.Screen name="Logout" component={Logout} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} />
      <Stack.Screen name="Otp" component={Otp} />
      <Stack.Screen name="Payment" component={Payment} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="Product" component={Product} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Promo" component={Promo} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Reset" component={Reset} />
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="ChangeLanguage" component={ChangeLanguage} />
      <Stack.Screen name="Feedback" component={Feedback} />
      <Stack.Screen name="PickUpDelivery" component={PickUpDelivery} />
      <Stack.Screen name="AppDemo" component={AppDemo} />

      {/* AppDemo */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default App;
