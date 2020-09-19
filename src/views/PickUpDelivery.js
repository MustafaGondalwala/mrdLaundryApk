import React, {Component} from 'react';
import { StyleSheet, Text, View, ScrollView, Image, FlatList, TouchableOpacity } from 'react-native';
import { Container, Header, Left, Body, Right, Title, Icon, Row, Footer, Tab, Tabs, Col, List, ListItem } from 'native-base';
import UIStepper from 'react-native-ui-stepper';
import { img_url, api_url, product, height_30, no_data } from '../config/Constants';
import { Loader } from '../components/GeneralComponents';
import * as colors from '../assets/css/Colors';
import axios from 'axios';
import { connect } from 'react-redux';
import { serviceActionPending, serviceActionError, serviceActionSuccess, addToCart } from '../actions/ProductActions';
import { subTotal, total, calculatePricing, selectDate,selectDeliveryTime,selectPickUpDate,selectPickUpTime } from '../actions/CartActions';
import Snackbar from 'react-native-snackbar';

import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
import strings from "../languages/strings.js";
import DateTimePicker from "react-native-modal-datetime-picker";
import { Button, Divider } from 'react-native-elements';



class PickUpDelivery extends Component<Props> {

  constructor(props) {
      super(props)
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
      this.state = {
        service_id:this.props.route.params.id,
        service_name:this.props.route.params.service_name,
        deliveryDatePickerVisible : false,
        deliveryDatePickerTimeVisible: false,
        pickupDatePickerVisible:false,
        pickupDatePickerTimeVisible:false
      }
  }

  showDeliveryDatePicker = () => {
    this.setState({ deliveryDatePickerVisible: true });
  };
  showDeliveryDateTimePicker = () => {
    this.setState({ deliveryDatePickerTimeVisible: true });
  }
  showPickupDatePicker = () => {
    this.setState({ pickupDatePickerVisible: true });
  }
  hidePickUpDatePicker = () => {
    this.setState({ pickupDatePickerVisible: false,pickupDatePickerTimeVisible: false });
  }
  hidePickUpDateTimePicker = () => {
    this.setState({ pickupDateTimePickerVisible: false });
  }
  showPickupDateTimePicker = () => {
    this.setState({ pickupDateTimePickerVisible: true });
  }
  hideDeliveryDatePicker = () => {
    this.setState({ deliveryDatePickerVisible: false, deliveryDatePickerTimeVisible:false});
  };
  handleDeliveryDatePicked = async(date) => {
    this.setState({ deliveryDatePickerVisible: false })
    var d = new Date(date);
    let delivery_date = d.getDate() + '/' + ("0" + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
    await this.props.selectDate(delivery_date);
  };
  handlePickUpDatePicked = async(d) => {
    this.setState({ pickupDatePickerVisible: false })
    let pickup_date = d.getDate() + '/' + ("0" + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
    await this.props.selectPickUpDate(pickup_date);
  }
  handlePickUpDateTimePicked = async(time) => {
    this.setState({ pickupDateTimePickerVisible: false })
    await this.props.selectPickUpTime(time.getHours()+":"+time.getMinutes())
  }

  handleDeliveryDateTimePicked = async(time) => {
    this.setState({ deliveryDatePickerTimeVisible: false })
    await this.props.selectDeliveryTime(time.getHours()+":"+time.getMinutes())
  }



  handleBackButtonClick= () => {
      this.props.navigation.goBack(null);
  }
  showSnackbar(msg){
    Snackbar.show({
      title:msg,
      duration: Snackbar.LENGTH_SHORT,
    });
  }

  select_address = () => {
    var error = false;
    if(this.props.pickup_date != undefined){
        error = true
      }else{
        this.showSnackbar(strings.please_choose_pickup_date);
        return false
      }
    if(this.props.pickup_time != undefined){
        error = true
    }else{
        this.showSnackbar(strings.please_choose_pickup_time);
        return false
    }

    if(this.props.delivery_date != undefined){
        error = true
      }else{
        this.showSnackbar(strings.please_choose_delivery_date);
        return false
      }

    if(this.props.delivery_time != undefined){
      error = true;
    }else{
      this.showSnackbar(strings.please_choose_delivery_time);
      return false;
    }
    
    if(error == true){
        this.props.navigation.navigate('Cart');
    }
  }
    updatePickupTime = async (value) => {
        await this.props.selectPickUpTime(value)
    }
    updateDeliveryTime = async (value) => {
        await this.props.selectDeliveryTime(value)
    }
  add_to_cart = async (qty,product_id,product_name,price) => {
     let cart_items = this.props.cart_items;
     let old_product_details = cart_items[this.state.service_id + '-' + product_id];
     let sub_total = parseFloat(this.props.sub_total);
     let total_price = parseFloat(qty * price);
     
     if(old_product_details != undefined && total_price > 0){
       let final_price = parseFloat(total_price) - parseFloat(old_product_details.price);
       sub_total = parseFloat(sub_total) + parseFloat(final_price);
     }else if(total_price > 0){
       let final_price = parseFloat(price);
       sub_total = parseFloat(sub_total) + parseFloat(final_price);
     }

     if(qty > 0){
        let product_data = {
          service_id: this.state.service_id,
          service_name: this.state.service_name,
          product_id: product_id,
          product_name: product_name,
          qty: qty,
          price: parseFloat(qty * price)
        }
        cart_items[this.state.service_id + '-' + product_id] = product_data;
        await this.props.addToCart(cart_items);
        await this.props.subTotal(sub_total);
     }else{
        delete cart_items[this.state.service_id + '-' + product_id];
        await this.props.addToCart(cart_items);
        await this.props.subTotal(parseFloat(sub_total) - parseFloat(price));
     }
     
  }

  cart = async () => {
    await this.props.navigation.navigate('Cart');
  }

  render() {

    const { isLoding, error, data, message, status, cart_items, cart_count, navigation } = this.props
    const {delivery_date,delivery_time,pickup_time,pickup_date } = this.props
    
    return (
      <Container>
        <Header androidStatusBarColor={colors.theme_bg} style={styles.header} >
          <Left style={{ flex: 1 }} >
            <Icon onPress={this.handleBackButtonClick} style={styles.icon} name='arrow-back' />
          </Left>
          <Body style={styles.header_body} >
            <Title style={styles.title} >{strings.pickup_delivery_title}</Title>
          </Body>
          <Right />
        </Header>
        <Tabs tabBarUnderlineStyle={{ backgroundColor:colors.theme_bg_three }}> 
            <Tab heading={strings.pickup} tabStyle={{backgroundColor: colors.theme_bg }} activeTabStyle={{backgroundColor: colors.theme_bg}} activeTextStyle={{color: colors.theme_bg_three, fontWeight: 'bold'}}>
                    <View style={styles.delivery_date}>
                    <Text style={styles.text_label}>{strings.select_pick_up_date}</Text>
                    <Button
                        title={strings.choose_expected_pickup_date}
                        type="outline"
                        buttonStyle={{ borderColor:colors.theme_fg }}
                        titleStyle={{ color:colors.theme_fg }}
                        onPress={this.showPickupDatePicker}
                    />
                    {
                        pickup_date ? <Text>{'\n'}{strings.pickup}: {pickup_date}</Text> : <Text>Not Yet Selected</Text>
                    }
                    <Text>{'\n'}</Text>
                    <Divider style={{ backgroundColor: colors.theme_fg_two }} />
                    <Text style={styles.text_label}>{strings.select_pick_up_time}</Text>
                    <Button type="outline"
                        title={strings.time_1}
                        buttonStyle={pickup_time != strings.time_1 ? styles.normal_button: styles.current_button}
                        onPress={() => this.updatePickupTime(strings.time_1)}
                        titleStyle={{ color:colors.theme_fg }} />
                    
                    <Button type="outline"
                        title={strings.time_2}
                        buttonStyle={pickup_time != strings.time_2 ? styles.normal_button: styles.current_button}
                        onPress={() => this.updatePickupTime(strings.time_2)}
                        titleStyle={{ color:colors.theme_fg }} />
                    
                    <Button type="outline"
                        title={strings.time_3}
                        buttonStyle={pickup_time != strings.time_3 ? styles.normal_button: styles.current_button}
                        onPress={() => this.updatePickupTime(strings.time_3)}
                        titleStyle={{ color:colors.theme_fg }} />
                    
                    <Button type="outline"
                        title={strings.time_4}
                        buttonStyle={pickup_time != strings.time_4 ? styles.normal_button: styles.current_button}
                        onPress={() => this.updatePickupTime(strings.time_4)}
                        titleStyle={{ color:colors.theme_fg }} />

                    <DateTimePicker
                        isVisible={this.state.pickupDatePickerVisible}
                        onConfirm={this.handlePickUpDatePicked}
                        onCancel={this.hidePickUpDatePicker}
                        minimumDate={new Date()}
                        maximumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                        mode='default'
                    />
                    </View>
            </Tab>
            <Tab heading={strings.delivery} tabStyle={{backgroundColor: colors.theme_bg }} activeTabStyle={{backgroundColor: colors.theme_bg}} activeTextStyle={{color: colors.theme_bg_three, fontWeight: 'bold'}}>
                    <View style={styles.delivery_date}>
                    <Text style={styles.text_label}>{strings.select_delivery_date}</Text>
                    <Button
                        title={strings.choose_expected_delivery_date}
                        type="outline"
                        buttonStyle={{ borderColor:colors.theme_fg }}
                        titleStyle={{ color:colors.theme_fg }}
                        onPress={this.showDeliveryDatePicker}
                    />
                    {
                        delivery_date ? <Text>{'\n'}{strings.delivery}: {delivery_date}</Text> : <Text>Not Yet Selected</Text>
                    }
                    <Text>{'\n'}</Text>
                    <Divider style={{ backgroundColor: colors.theme_fg_two }} />
                    <Text style={styles.text_label}>{strings.select_delivery_time}</Text>
                    <Button type="outline"
                        title={strings.time_1}
                        buttonStyle={delivery_time != strings.time_1 ? styles.normal_button: styles.current_button}
                        onPress={() => this.updateDeliveryTime(strings.time_1)}
                        titleStyle={{ color:colors.theme_fg }} />
                    
                    <Button type="outline"
                        title={strings.time_2}
                        buttonStyle={delivery_time != strings.time_2 ? styles.normal_button: styles.current_button}
                        onPress={() => this.updateDeliveryTime(strings.time_2)}
                        titleStyle={{ color:colors.theme_fg }} />
                    
                    <Button type="outline"
                        title={strings.time_3}
                        buttonStyle={delivery_time != strings.time_3 ? styles.normal_button: styles.current_button}
                        onPress={() => this.updateDeliveryTime(strings.time_3)}
                        titleStyle={{ color:colors.theme_fg }} />
                    
                    <Button type="outline"
                        title={strings.time_4}
                        buttonStyle={delivery_time != strings.time_4 ? styles.normal_button: styles.current_button}
                        onPress={() => this.updateDeliveryTime(strings.time_4)}
                        titleStyle={{ color:colors.theme_fg }} />

                        <DateTimePicker
                        isVisible={this.state.deliveryDatePickerVisible}
                        onConfirm={this.handleDeliveryDatePicked}
                        onCancel={this.hideDeliveryDatePicker}
                        minimumDate={new Date(Date.now()+7*24*60*60*100)}
                        maximumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                        mode='default'
                        />
                    </View>
            </Tab>
        </Tabs>
          <Footer style={styles.footer} >
            <TouchableOpacity activeOpacity={1} onPress={() => this.select_address()} style={styles.footer_container}>
              <Row>
                <Col style={styles.view_cart_container} >
                  <Text style={styles.view_cart} >{strings.view_cart}</Text>
                </Col>
              </Row>
            </TouchableOpacity>
          </Footer>
        <Loader visible={isLoding} />
      </Container>
    );
  }
}

function mapStateToProps(state){
  return{
    isLoding : state.product.isLoding,
    error : state.product.error,
    data : state.product.data,
    message : state.product.message,
    status : state.product.status,
    cart_items : state.product.cart_items,
    cart_count : state.product.cart_count,
    sub_total : state.cart.sub_total,
    delivery_date : state.cart.delivery_date,
    delivery_time: state.cart.delivery_time,
    pickup_date: state.cart.pickup_date,
    pickup_time: state.cart.pickup_time,
  };
}

const mapDispatchToProps = (dispatch) => ({
    serviceActionPending: () => dispatch(serviceActionPending()),
    serviceActionError: (error) => dispatch(serviceActionError(error)),
    serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data)),
    addToCart: (data) => dispatch(addToCart(data)),
    subTotal: (data) => dispatch(subTotal(data)),
    selectDate: (data) => dispatch(selectDate(data)),
    selectDeliveryTime: (data) => dispatch(selectDeliveryTime(data)),
    selectPickUpDate: (data) => dispatch(selectPickUpDate(data)),
    selectPickUpTime: (data) => dispatch(selectPickUpTime(data)),
});


export default connect(mapStateToProps,mapDispatchToProps)(PickUpDelivery);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.theme_bg_two,
  },

  normal_button:{
      padding:10,margin:10,
      borderColor:colors.theme_fg 
  },
  current_button:{
    padding:10,margin:10,
    borderColor:colors.theme_fg,
    backgroundColor:"lightblue"
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
  text_label:{
    padding:10
  },    
  title:{
    alignSelf:'center', 
    color:colors.theme_fg_two,
    alignSelf:'center', 
    fontSize:16, 
    fontWeight:'bold'
  },
  image_container:{
    height:75, 
    width:75
  },
  product_name:{
    fontSize:15, 
    fontWeight:'bold', 
    color:colors.theme_fg_two
  },
  price:{
    fontSize:15, 
    color:colors.theme_fg
  },
  piece:{
    fontSize:12, 
    color:colors.theme_fg
  },
  footer:{
    backgroundColor:'transparent'
  },
  footer_container:{
    width:'100%', 
    backgroundColor:colors.theme_bg
  },
  view_cart_container:{
    alignItems:'center',
    justifyContent:'center'
  },
  view_cart:{
    color:colors.theme_fg_three, 
    fontWeight:'bold'
  },
  delivery_date:{
    padding:20, 
    justifyContent:'center'
  },
  delivery_date_text:{
    color:colors.theme_fg, 
    marginBottom:20
  },
});

