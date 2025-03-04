import React, { Component } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Icon } from 'native-base';
import { height_60 } from '../config/Constants';
import { StatusBar } from '../components/GeneralComponents';
import { connect } from 'react-redux';
import * as colors from '../assets/css/Colors';
import CodeInput from 'react-native-confirmation-code-input';
import { CommonActions } from '@react-navigation/native';
import strings from "../languages/strings.js";

class Otp extends Component<Props>{

  constructor(props) {
      super(props)
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
  
  handleBackButtonClick() {
      this.props.navigation.goBack(null);
      return true;
  }

   _onFinishCheckingCode2(code) {
    if (code != this.props.otp) {
      alert('Code not match!');
    } else {
      this.reset();
    }
  }

  reset(){
    this.props.navigation.navigate('Reset');
  }

  render() {

    const { otp } = this.props
    
    return (
      <ScrollView keyboardShouldPersistTaps='always'>
        <View style={styles.container}>
          <View>
            <StatusBar/>
          </View>
          <View style={styles.block_one} >
            <View style={styles.back_content} >
              <Icon onPress={this.handleBackButtonClick} style={styles.back_icon} name='arrow-back' />
            </View>
            <View>
              <Text style={styles.enter_otp} >{strings.enter_otp}</Text>
            </View>
            <View style={styles.code_content} >
              <Text style={styles.description} >{strings.enter_the_code_you_have_received_by_email_in_order_to_verify_account}</Text>
            </View>
            <View style={styles.code}>
              <CodeInput
                ref="codeInputRef2"
                keyboardType="numeric"
                codeLength={4}
                className='border-circle'
                autoFocus={false}
                codeInputStyle={{ fontWeight: '800' }}
                activeColor={colors.theme_bg}
                inactiveColor={colors.theme_bg}
                onFulfill={(isValid) => this._onFinishCheckingCode2(isValid)}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    )
  }
}

function mapStateToProps(state){
  return{
    otp : state.forgot.data.otp
  };
}

export default connect(mapStateToProps,null)(Otp);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:colors.theme_bg_three
  },
  back_icon:{
    color:colors.theme_bg
  },
  back_content:{
    width: '100%',  
    position:'absolute', 
    top:10, 
    left:10
  },
  block_one:{
    width: '100%', 
    height: height_60, 
    backgroundColor: colors.theme_bg_three, 
    alignItems:'center', 
    justifyContent:'center'
  },
  enter_otp:{
    color:colors.theme_fg, 
    marginTop:20, 
    fontSize:20, 
    fontWeight:'bold'
  },
  code_content:{
    paddingLeft:20, 
    paddingRight:20
  },
  description:{
    marginTop:20, 
    fontSize:13, 
    textAlign:'center', 
    color:colors.theme_fg
  },
  code:{
    height: "20%",
    marginTop: "5%", 
    textAlign: 'center'
  }
});
