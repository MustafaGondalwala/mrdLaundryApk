import React, {Component} from 'react';
import { StyleSheet, Text, FlatList,View,ScrollView, ImageBackground, TouchableOpacity, Image, Picker, I18nManager } from 'react-native';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Title, Button, Icon } from 'native-base';
import { api_url, faq } from '../config/Constants';
import * as colors from '../assets/css/Colors';
import { Loader } from '../components/GeneralComponents';
import axios from 'axios';
import { connect } from 'react-redux'; 
import { serviceActionPending, serviceActionError, serviceActionSuccess } from '../actions/FaqActions';
import { CommonActions } from '@react-navigation/native';
import strings from "../languages/strings.js";
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-community/async-storage';

class ChangeLanguage extends Component<Props> {

  constructor(props) {
      super(props)
      this.state = {
        language : global.lang,
      }
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
      this.Faq();
  }

  handleBackButtonClick= () => {
      this.props.navigation.goBack(null);
  }

  faq_details = (data) => {
    this.props.navigation.navigate('FaqDetails',{ data : data }); 
  }

  async language_change(lang){
    console.log(lang)
    try {
      await AsyncStorage.setItem('lang', lang);
      await strings.setLanguage(lang);
      await RNRestart.Restart();
    } catch (e) {
      console.log("error occured",e)
    }
  }


  Faq = async () => {
    this.props.serviceActionPending();
    await axios({
      method: 'post', 
      url: api_url + faq,
      data:{ lang: global.lang }
    })
    .then(async response => {
        await this.props.serviceActionSuccess(response.data)
    })
    .catch(error => {
        this.props.serviceActionError(error);
    });
  }


  render() {

    const { isLoding, error, data, message, status } = this.props

    return (
      <Container>
        <Header androidStatusBarColor={colors.theme_bg} style={styles.header} >
          <Left style={{ flex: 1 }} >
            <Button onPress={this.handleBackButtonClick} transparent>
              <Icon style={styles.icon} name='arrow-back' />
            </Button>
          </Left>
          <Body style={styles.header_body} >
            <Title style={styles.title} >{strings.change_language}</Title>
          </Body>
          <Right />
        </Header>
        <Content>
        <View>
            <Picker
              selectedValue={this.state.language}
              style={{height: 50, width: 300, color:colors.theme_fg_two}}
              onValueChange={(itemValue, itemIndex) =>
                this.language_change(itemValue)
              }>
              <Picker.Item label="English" value="en" />
              <Picker.Item label="Gujarati" value="gj" />
              <Picker.Item label="Hindi" value="hi" />
            </Picker>
          </View>
        </Content>
        <Loader visible={isLoding} />
      </Container>
    );
  }
}

function mapStateToProps(state){
  return{
    isLoding : state.faq.isLoding,
    error : state.faq.error,
    data : state.faq.data,
    message : state.faq.message,
    status : state.faq.status,
  };
}

const mapDispatchToProps = (dispatch) => ({
    serviceActionPending: () => dispatch(serviceActionPending()),
    serviceActionError: (error) => dispatch(serviceActionError(error)),
    serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data))
});


export default connect(mapStateToProps,mapDispatchToProps)(ChangeLanguage);

const styles = StyleSheet.create({
  header:{
    backgroundColor:colors.theme_bg_three
  },
  icon:{
    color:colors.theme_fg_two
  },
  header_body: {
    flex: 3,
    justifyContent: 'center'
  },
  title:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    alignSelf:'center', 
    fontSize:16, 
    fontWeight:'bold'
  },
  faq_title:{
    color:colors.theme_fg_two,
    fontSize:15
  }
});
