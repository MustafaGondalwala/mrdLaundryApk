import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInput, ScrollView, Image, Keyboard  } from 'react-native';
import { Button, Icon, Input } from 'react-native-elements';
import { Container, Content, Card, CardItem, Row, Col, Body, Footer} from 'native-base';
import Snackbar from 'react-native-snackbar';
import { api_url, login,otp, height_40, height_30, height_15, login_image } from '../config/Constants';
import { StatusBar, Loader } from '../components/GeneralComponents';
import axios from 'axios';
import { connect } from 'react-redux';
import { serviceActionPending, serviceActionError, serviceActionSuccess } from '../actions/LoginActions';
import AsyncStorage from '@react-native-community/async-storage';
import { CommonActions } from '@react-navigation/native';
import * as colors from '../assets/css/Colors';
import strings from "../languages/strings.js";

class Login extends Component<Props>{

  constructor(props) {
      super(props)
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
      this.state = {
        phone_number: '',
        validation:true,
        fcm_token:global.fcm_token
      }
  }
 
  handleBackButtonClick() {
      this.props.navigation.goBack(null);
      return true;
  }

  send_otp = async () => {
    Keyboard.dismiss();
    await this.checkValidate();
    if(this.state.validation){
        this.props.serviceActionPending();
        await axios({
          method: 'post', 
          url: api_url + otp,
          data:{ phone_number: this.state.phone_number }
        })
        .then(async response => {
            await this.props.serviceActionSuccess(response.data);
            console.log(response.data)
            if(response.data.status == 0){
              alert(response.data.message)
              this.props.serviceActionError(response.data.message);
            }else{
              this.props
            .navigation.dispatch(
                CommonActions.reset({
                index: 0,
                routes: [{ name: "OtpLogin",'phone_number':this.state.phone_number}],
              })
            );
            }
            
          })
        .catch(error => {
            alert(error);
            this.props.serviceActionError(error);
        });
    }
  }

  checkValidate(){
    if(this.state.phone_number == '' ){
      this.state.validation = false;
      this.showSnackbar("Please fill all the fields.");
      return true;
    }else{
      this.state.validation = true;
      return true;
    }
  }

  saveData = async () =>{
    if(this.props.status == 1){
     try {
        await AsyncStorage.setItem('user_id', this.props.data.id.toString());
        await AsyncStorage.setItem('customer_name', this.props.data.customer_name.toString());
        global.id = await this.props.data.id;
        global.customer_name = await this.props.data.customer_name;
        await this.home();
      } catch (e) {

      }
    }else{
      alert(this.props.message);
    }
  }

  register = () => {
    this.props.navigation.navigate('Register');
  }

  forgot = () => {
    this.props.navigation.navigate('Forgot');
  }

  home = () => {
    this.props
     .navigation.dispatch(
      CommonActions.reset({
       index: 0,
       routes: [{ name: "Home" }],
     })
    );
  }

  showSnackbar(msg){
    Snackbar.show({
      title:msg,
      duration: Snackbar.LENGTH_SHORT,
    });
  }

  render() {

    const { isLoding, error, data, message, status } = this.props

    return (
      <ScrollView keyboardShouldPersistTaps='always'>
        <View style={styles.container}>
          <View>
            <StatusBar/>
          </View>
          <Loader visible={isLoding} />
          <View style={styles.header_section} >
            <View style={styles.logo_content} >
              <Image
                style={styles.logo}
                source={login_image}
              />
            </View>
          </View>
          <View style={styles.bottom_section} >
            <Card style={{ marginLeft:15, marginRight:15, borderRadius: 20 }}>
              <CardItem bordered style={{ borderRadius: 20}}>
                <View style={styles.body_section} >
                  <Text style={styles.register_name} >Demo</Text>
                  <View style={styles.input}>
                    <Text style={{ color:colors.theme_fg, fontSize:16 }}>App will functioning by 24-Sep 2020. Please update the app.</Text>
                  </View>
                  <View style={{margin:10}}/>
                
                </View>
              </CardItem>
            </Card>
          </View>
        </View>
      </ScrollView>
    )
  }
}

function mapStateToProps(state){
  return{
    isLoding : state.login.isLoding,
    error : state.login.error,
    data : state.login.data,
    message : state.login.message,
    status : state.login.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
    serviceActionPending: () => dispatch(serviceActionPending()),
    serviceActionError: (error) => dispatch(serviceActionError(error)),
    serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data))
});

export default connect(mapStateToProps,mapDispatchToProps)(Login);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  header_section:{
    width: '100%', 
    height: height_40, 
    backgroundColor: colors.theme_bg, 
    alignItems:'center', 
    justifyContent:'center'
  },
  logo_content:{
    height:105, 
    width:225
  },
  logo:{
    flex:1 , 
    width: undefined, 
    height: undefined
  },
  register_name:{
    color:colors.theme_fg, 
    fontSize:20, 
    fontWeight:'bold',
    alignSelf:'flex-start',
    marginBottom:20
  },
  body_section:{
    width: '100%',
    backgroundColor: colors.theme_bg_three, 
    alignItems:'center', 
    justifyContent:'center'
  },
  input:{
    height:30, 
    width:'100%',
    marginTop:10 ,
    marginBottom:10
  },
  input_text:{
    borderColor: colors.theme_bg, 
    borderWidth: 1, 
    padding:10, 
    borderRadius:5
  },
  footer_section:{
    width: '100%', 
    alignItems:'center'
  },
  login_content:{
    width:'100%', 
    margin:5, 
    alignItems:'center'
  },
  login_string:{
    color:colors.theme_fg
  },
  btn_style:{
    backgroundColor:colors.theme_bg
  },
  bottom_section:{
    left: 0,
    top: -60,
  },
  email:{
  borderColor: colors.theme_bg, 
  borderWidth: 1, 
  padding:10, 
  borderRadius:5,
  height:40
},
forgot_password_container:{
  width:'95%', 
  alignItems:'flex-end'
},
signup_container:{
  width:'100%',
  justifyContent:'flex-end',
  alignItems:'center'
},
});
