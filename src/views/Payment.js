import React, {Component} from 'react';
import { StyleSheet, View, Text, FlatList, Image, Alert } from 'react-native';
import { Container, Header, Content, Left, Body, Right, Title, Button as Btn, Icon, Footer, ListItem } from 'native-base';
import { api_url, place_order, payment_list, img_url, stripe_payment,create_razorpay_order,razorpay_secret,razorpay_keyid,logo_url,validate_payment } from '../config/Constants';
import * as colors from '../assets/css/Colors';
import { Loader } from '../components/GeneralComponents';
import { Button } from 'react-native-elements';
import axios from 'axios';
import { connect } from 'react-redux';
import { orderServicePending, orderServiceError, orderServiceSuccess, paymentListPending, paymentListError, paymentListSuccess, stripePending, stripeError, stripeSuccess } from '../actions/PaymentActions';
import { reset } from '../actions/CartActions';
import { productReset } from '../actions/ProductActions';
import RadioForm from 'react-native-simple-radio-button';
import { CommonActions, TabActions } from '@react-navigation/native';
import stripe from 'tipsi-stripe';
import strings from "../languages/strings.js";
import RazorpayCheckout from 'react-native-razorpay';


class Payment extends Component<Props> {

  constructor(props) {
      super(props)
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
      this.select_payment_method = this.select_payment_method.bind(this);
      this.move_orders = this.move_orders.bind(this);
      this.razorpay = this.razorpay.bind(this)
      this.getOrderId = this.getOrderId.bind(this)
      this.state={
        payment_mode:1
      }
      this.get_payments();
  }

  handleBackButtonClick= () => {
      this.props.navigation.goBack(null);
  }

  stripe_card = async() =>{

    stripe.setOptions({
      publishableKey: "pk_test_51HIsg4AN9bqFqDCuFTrSUipem9TJNdC6c0dW0G2AEy4cAL1gOFvsBoeLGABilSBCLWjmrkb9pKUkoCsndW8wb1fj00KiDk4Z71",
      merchantId: 'MERCHANT_ID', // Optional
      androidPayMode: 'test', // Android only
    })

    let options = {
      requiredBillingAddressFields: 'full',
      prefilledInformation: {
        billingAddress: {
           name: global.customer_name,
        },
      },
    }

   const response = await stripe.paymentRequestWithCardForm(options);
  //  console.log(response.card)
    // if(response.tokenId){
      this.stripe_payment(response.tokenId);
    // }else{
    //   alert(strings.sorry_something_went_wrong);
    // }
  }

  stripe_payment = async (token) => {
    this.props.stripePending();
    await axios({
      method: 'post', 
      url: api_url + stripe_payment,
      data:{ customer_id : global.id, amount:this.props.total, token: token}
    })
    .then(async response => {
      this.place_order(response.data.result);
      await this.props.stripeSuccess(response.data.result);
    })
    .catch(error => {
      alert(strings.sorry_something_went_wrong);
      this.props.stripeError(error);
    });
  }


  place_order = async (payment_response) => {
    // const {pickup_time,pickup_date,delivery_date,delivery_time} = this.props
    // console.log(pickup_time,pickup_date,delivery_date,delivery_time)
    var delivery_charge = 0
    if(this.props.sub_total < global.min_bill){
      delivery_charge = global.delivery_charge
    }
    console.log({ customer_id: global.id, payment_response:payment_response, payment_mode: this.state.payment_mode,address_id:this.props.address, expected_delivery_date:this.props.delivery_date, total:this.props.total, discount:this.props.discount, sub_total:this.props.sub_total, promo_id:this.props.promo_id, items: JSON.stringify(Object.values(this.props.items)) });
    this.props.orderServicePending();
    await axios({
      method: 'post', 
      url: api_url + place_order,
      data:{ customer_id: global.id, payment_response:payment_response, payment_mode: this.state.payment_mode,address_id:this.props.address,delivery_date:this.props.delivery_date,delivery_time:this.props.delivery_time ,pickup_time:this.props.pickup_time,pickup_date:this.props.pickup_date, total:this.props.total, discount:this.props.discount, sub_total:this.props.sub_total, promo_id:this.props.promo_id,delivery_charge:delivery_charge,items: JSON.stringify(Object.values(this.props.items)) }
    })
    .then(async response => {
      console.log(response)
      await this.props.orderServiceSuccess(response.data);
      await this.open_success_popup();
    })
    .catch(error => {
      console.log(error.response)
      this.props.orderServiceError(error);
    });
  }

  open_success_popup = async() =>{
    Alert.alert(
      strings.success,
      strings.your_order_successfully_placed,
      [
        { text: strings.ok, onPress: () => this.move_orders() }
      ],
      { cancelable: false }
    );
  }

  get_payments = async () => {
    this.props.paymentListPending();
    await axios({
      method: 'post', 
      url: api_url + payment_list,
      data:{ lang: global.lang }
    })
    .then(async response => {
      await this.props.paymentListSuccess(response.data.result);
    })
    .catch(error => {
      this.props.paymentListError(error);
    });
  }

  async move_orders(){
    await this.props.reset();
    await this.props.productReset();
    this.props.navigation.navigate('MyOrders');
  }


  async select_payment_method(payment_mode){
    await this.setState({ payment_mode : payment_mode});
    if(this.state.payment_mode == 1){
      this.place_order('cash');
    }else if(this.state.payment_mode == 2){
      this.razorpay();
    }
  }

  async getOrderId(amount){
    return await axios.post(api_url+create_razorpay_order,{
        "amount":amount
    }).then(response => {
      const {order_id} = response.data 
      return order_id
    }).catch(error => {
      console.log(error.response.data)
    })
  }

  async razorpay(){
    this.props.orderServicePending();
    var amount = parseInt(this.props.total+"00")
    var order_id = await this.getOrderId(amount)
    var email = global.customer_name+"@gmail.com"
    var phone_number = global.phone_number
    var options = {
      description: 'Payment for Laundry',
      image: "https://cdn.razorpay.com/logos/FfcvoTshYJgjM0_original.png",
      currency: 'INR',
      key: global.RAZORPAY_KEYID,
      amount: amount,
      name: strings.app_name,
      order_id: order_id,//Replace this with an order_id created using Orders API. Learn more at https://razorpay.com/docs/api/orders.
      prefill: {
        email: email,
        contact: phone_number,
        name: global.customer_name
      },
      theme: {color: '#528FF0'}
    }
    RazorpayCheckout.open(options).then((data) => {
      const {razorpay_order_id,razorpay_payment_id,razorpay_signature} = data
      axios.post(api_url+validate_payment,{
        razorpay_order_id,razorpay_payment_id,razorpay_signature
      }).then(response => {
        const {success} = response.data
        this.place_order('online');
      }).catch(error => {
        alert(error.response.data)
      })
    }).catch((error) => {
      alert(error.error.description)
    });
  }
  render() {

    const { isLoding, error, data, message, status, payments } = this.props
    
    return (
      <Container>
        <Header androidStatusBarColor={colors.theme_bg} style={styles.header} >
          <Left style={{ flex: 1 }} >
            <Btn onPress={this.handleBackButtonClick} transparent>
              <Icon style={styles.icon} name='arrow-back' />
            </Btn>
          </Left>
          <Body style={styles.heading} >
            <Title style={styles.title} >{strings.payment_mode}</Title>
          </Body>
          <Right />
        </Header>
        <Content style={{ padding:20 }} >
          {/*<RadioForm
            radio_props={radio_props}
            initial={0}
            animation={true}
            onPress={this.select_payment_method}
            labelStyle={styles.radio_style}
          />*/}
          <FlatList
            data={payments}
            renderItem={({ item,index }) => (
              <ListItem icon onPress={() => this.select_payment_method(item.id)}>
                <Left>
                  <View style={{ height:30, width:30 }} >
                    <Image
                      style= {{flex:1 , width: undefined, height: undefined}}
                      source={{ uri : img_url + item.icon }}
                    />
                  </View>
                </Left>
                <Body>
                  <Text>{item.payment_mode}</Text>
                </Body>
                <Right />
              </ListItem>
            )}
            keyExtractor={item => item.payment_mode}
          />
        </Content>
        <Loader visible={isLoding} />
      </Container>
    );
  }
}

function mapStateToProps(state){
  return{
    isLoding : state.payment.isLoding,
    error : state.payment.error,
    data : state.payment.data,
    message : state.payment.message,
    status : state.payment.status,
    payments : state.payment.payments,
    address : state.cart.address,
    pickup_date: state.cart.pickup_date,
    pickup_time: state.cart.pickup_time,
    delivery_date : state.cart.delivery_date,
    delivery_time: state.cart.delivery_time,
    total : state.cart.total_amount,
    sub_total : state.cart.sub_total,
    discount : state.cart.promo_amount,
    promo_id : state.cart.promo_id,
    items : state.product.cart_items
  };
}

const mapDispatchToProps = (dispatch) => ({
    orderServicePending: () => dispatch(orderServicePending()),
    orderServiceError: (error) => dispatch(orderServiceError(error)),
    orderServiceSuccess: (data) => dispatch(orderServiceSuccess(data)),
    paymentListPending: () => dispatch(paymentListPending()),
    paymentListError: (error) => dispatch(paymentListError(error)),
    paymentListSuccess: (data) => dispatch(paymentListSuccess(data)),
    stripePending: () => dispatch(stripePending()),
    stripeError: (error) => dispatch(stripeError(error)),
    stripeSuccess: (data) => dispatch(stripeSuccess(data)),
    reset: () => dispatch(reset()),
    productReset: () => dispatch(productReset())
});


export default connect(mapStateToProps,mapDispatchToProps)(Payment);

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
  radio_style:{
    marginLeft:20, 
    fontSize: 17, 
    color: colors.theme_bg, 
    fontWeight:'bold'
  },
  footer:{
    backgroundColor:'transparent'
  },
  footer_content:{
    width:'90%'
  },
  place_order:{
    backgroundColor:colors.theme_bg
  }
});
