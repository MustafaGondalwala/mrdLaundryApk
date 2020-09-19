import React, {Component} from 'react';
import { StyleSheet, Text, FlatList,View,ScrollView, ImageBackground, TouchableOpacity, Image, Picker, I18nManager,TextInput } from 'react-native';
import { Container, Header, Content,Item, List, ListItem, Left, Body, Right, Title, Button, Icon } from 'native-base';
import { api_url,customer_feedback, faq,height_40 } from '../config/Constants';
import * as colors from '../assets/css/Colors';
import { Loader } from '../components/GeneralComponents';
import axios from 'axios';
import { connect } from 'react-redux'; 
import { serviceActionPending, serviceActionError, serviceActionSuccess } from '../actions/FaqActions';
import { CommonActions } from '@react-navigation/native';
import strings from "../languages/strings.js";
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-community/async-storage';
import { Rating, AirbnbRating } from 'react-native-ratings';
import Snackbar from 'react-native-snackbar';


class Feedback extends Component<Props> {

  constructor(props) {
      super(props)
      this.state = {
        language : global.lang,
        title:"",
        description:"",
        rating:3
      }
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
      this.Faq();
      this.submitfeedback();
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
      if(lang == 'ar'){
        await I18nManager.forceRTL(true);
        await RNRestart.Restart();
      }else{
        await I18nManager.forceRTL(true);
        await RNRestart.Restart();
      }
    } catch (e) {
      console.log("error occured",e)
    }
  }


  Faq = async () => {
    this.props.serviceActionPending();
    await axios({
      method: 'post', 
      url: api_url + customer_feedback,
      data:{ lang: global.lang }
    })
    .then(async response => {
        await this.props.serviceActionSuccess(response.data)
    })
    .catch(error => {
        this.props.serviceActionError(error);
    });
  }

  showSnackbar(msg){
    Snackbar.show({
      title:msg,
      duration: Snackbar.LENGTH_SHORT,
    });
  } 

  submitfeedback = async() => {
    console.log({customer_id: global.id,title:this.state.title,description:this.state.description,rating:this.state.rating})
    const error = this.state
    if(error.title == ""){
      this.showSnackbar("Title is Required.")
      return false
    }
    if(error.description == ""){
      this.showSnackbar("Description is Required.")
      return false
    }
      await axios({
        method: 'post', 
        url: api_url + customer_feedback,
        data:{ customer_id: global.id,title:this.state.title,description:this.state.description,rating:this.state.rating }
      })
      .then(async response => {
        console.log(response.data)
        if(response.data.status == 1){
          alert(response.data.message)
          await this.setState({
            description:"",
            title:"",
            rating:3
          })
        }
      })
      .catch(error => {
        console.log(error.response.data)
        alert("Error Occurred. Please try again Later ...")
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
            <Title style={styles.title} >{strings.feedback}</Title>
          </Body>
          <Right />
        </Header>
        <Content>
      <View >
        <View  >
        <TextInput
            placeholder="Title"
            value={this.state.title}
            onChangeText={ TextInputValue =>
                  this.setState({title : TextInputValue }) }
            placeholderTextColor="grey"
            />
        </View>
        <View style={styles.textAreaContainer} >
            <TextInput
                style={styles.textArea}
                value={this.state.description}
                underlineColorAndroid="transparent"
                placeholder="Description"
                placeholderTextColor="grey"
                numberOfLines={10}
                multiline={true}
                onChangeText={ TextInputValue =>
                  this.setState({description : TextInputValue }) }
            />
            
        </View>
        <Text></Text>
        <View>
                  <AirbnbRating 
                    defaultRating={this.state.rating}
                    onFinishRating={rating => {
                      this.setState({
                        rating
                      })
                    }}
                  />
                  </View>
                  <View>
                  <Button
                    onPress={this.submitfeedback}
                    title={strings.submit}
                   full>
                   <Text style={styles.white}>{strings.submit}</Text>
                   </Button>
                   </View>
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


export default connect(mapStateToProps,mapDispatchToProps)(Feedback);

const styles = StyleSheet.create({
    white:{
        color:"white"
    },
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
  },
  textAreaContainer: {
    borderColor: colors.grey20,
    borderWidth: 1,
    padding: 5
  },
  textArea: {
    height: 150,
    justifyContent: "flex-start"
  }
});
