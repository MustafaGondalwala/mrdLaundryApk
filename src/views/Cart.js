import React, {Component} from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Container, Header, Left, Body, Right, Title, Icon, Row, Footer, Col, List, ListItem } from 'native-base';
import { Button, Divider } from 'react-native-elements';
import { Loader } from '../components/GeneralComponents';
import { connect } from 'react-redux';
import { subTotal, total, calculatePricing, selectDate,selectDeliveryTime,selectPickUpDate,selectPickUpTime } from '../actions/CartActions';
import DateTimePicker from "react-native-modal-datetime-picker";
import Snackbar from 'react-native-snackbar';
import * as colors from '../assets/css/Colors';
import strings from "../languages/strings.js";

class Cart extends Component<Props> {

  constructor(props) {
      super(props)
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
      this.state = {
        deliveryDatePickerVisible : false,
        deliveryDatePickerTimeVisible: false,
        pickupDatePickerVisible:false,
        pickupDatePickerTimeVisible:false
      }
  }

  async componentDidMount(){
  // this._unsubscribe=this.props.navigation.addListener('focus',()=>{
  //   this.calculate_total();
  // });
    this.calculate_total();

}
componentWillUnmount(){
  // this._unsubscribe();
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

  calculate_total(){
    this.props.calculatePricing();
    promo = this.props.promo;
    if(promo == undefined){
      if(this.props.sub_total < global.min_bill)
        this.props.total({ promo_amount:0, total:this.props.sub_total+global.delivery_charge });
      else
        this.props.total({ promo_amount:0, total:this.props.sub_total });
    }else{
      if(promo.promo_type == 1){
        this.props.total({ promo_amount:promo.discount, total:this.props.sub_total - promo.discount });
      }else{
        let discount = (promo.discount /100) * this.props.sub_total;
        if(this.props.sub_total < global.min_bill)
          this.props.total({ promo_amount:discount, total:this.props.sub_total+global.delivery_charge });
        else
          this.props.total({ promo_amount:discount, total:this.props.sub_total });
      }
      
    }
  }

  handleBackButtonClick= () => {
      this.props.navigation.goBack(null);
  }

  address_list = () => {
    this.props.navigation.navigate('AddressList');
  }

  select_address = () => {
    var error = false;
    if(this.props.delivery_time != undefined){
      error = true;
    }else{
      this.showSnackbar(strings.please_choose_delivery_time);
      return false;
    }
    if(this.props.delivery_date != undefined){
      error = true
    }else{
      this.showSnackbar(strings.please_choose_delivery_date);
      return false
    }
    if(this.props.pickup_time != undefined){
      error = true
    }else{
      this.showSnackbar(strings.please_choose_pickup_time);
      return false
    }
    if(this.props.pickup_date != undefined){
      error = true
    }else{
      this.showSnackbar(strings.please_choose_pickup_date);
      return false
    }
    if(error == true){
      this.props.navigation.navigate('AddressList',{ from:'cart' });
    }
  }

  showSnackbar(msg){
    Snackbar.show({
      title:msg,
      duration: Snackbar.LENGTH_SHORT,
    });
  }

  promo = () => {
    this.props.navigation.navigate('Promo');
  }

  render() {

    const { isLoding, cart_items, sub_total, total_amount, promo_amount, promo, delivery_date,delivery_time,pickup_time,pickup_date } = this.props
console.log(pickup_time,pickup_date,total_amount)
    return (
      <Container>
        <Header androidStatusBarColor={colors.theme_bg} style={styles.header} >
          <Left style={{ flex: 1 }} >
            <Icon onPress={this.handleBackButtonClick} style={styles.icon} name='arrow-back' />
          </Left>
          <Body style={styles.header_body} >
            <Title style={styles.title} >{strings.cart}</Title>
          </Body>
          <Right />
        </Header>
        <ScrollView>
          <Divider style={{ backgroundColor: colors.theme_fg_two }} />
          <Row style={{ padding:10 }} >
            <Left>
              <Text>{strings.your_clothes}</Text>
            </Left>
          </Row>
          <List>
          {Object.keys(cart_items).map(function(key) {
            return <ListItem>
              <Row>
                <Col style={{ width:40 }} >
                  <Text style={styles.qty} >{cart_items[key].qty}x</Text>
                </Col>
                <Col>
                  <Text>{cart_items[key].product_name}( {cart_items[key].service_name} )</Text>
                </Col>
                <Col style={{ width:50 }} >
                  <Text>{global.currency}{cart_items[key].price}</Text>
                </Col>
              </Row>
            </ListItem> 
          })}
          </List>
          { promo === undefined ?
          <Row style={{ padding:20 }} >
            <Col style={{ width:50 }} >
              <Icon style={{ color:colors.theme_fg_two }} name='pricetag' />
            </Col>
            <Col>
              <Text style={{ fontSize:12 }} >No promotion applied.Choose your promotion here.</Text>
              <Text onPress={() => this.promo()} style={styles.choose_promotion}>{strings.choose_promotion}</Text>
            </Col>
          </Row> : 
          <Row style={{ padding:20 }} >
            <Col style={{ width:50 }} >
              <Icon style={{ color:colors.theme_fg }} name='pricetag' />
            </Col>
            <Col>
              <Text style={styles.promotion_applied} >Promotion applied</Text>
              <Text style={{ fontSize:12 }} >You are saving {global.currency}{promo_amount}</Text>
              <Text onPress={() => this.promo()} style={styles.change_promo}>Change promo</Text>
            </Col>
          </Row>
          }
          <Divider style={{ backgroundColor: colors.theme_fg_two }} />
          <Row style={styles.sub_total} >
            <Col>
              <Text>{strings.subtotal}</Text>
            </Col>
            <Col style={{ width:50 }} >
              <Text style={{ fontWeight:'bold' }} >{global.currency}{sub_total}</Text>
            </Col>
          </Row>
          <Row style={styles.discount} >
            <Col>
              <Text>{strings.discount}</Text>
            </Col>
            <Col style={{ width:50 }} >
              <Text style={{ fontWeight:'bold' }} >{global.currency}{promo_amount}</Text>
            </Col>
          </Row>
          <Row style={styles.total} >
            <Col>
              <Text>{strings.delivery_charge}
              </Text>
              <Text style={styles.small_red_text}>
              {'\n'}minimum {global.currency}{global.min_bill} and above Delivery Free
              </Text>
            </Col>
            <Col style={{ width:50 }} >
            {
              this.props.sub_total < 50 ? 
              <Text style={styles.total_amount} >{global.currency}
              {global.delivery_charge}
              </Text>
              :
              <Text style={styles.total_amount}>{global.currency} 0</Text>
              }
            </Col>
          </Row>
          <Row style={styles.total} >
            <Col>
              <Text>{strings.total}</Text>
            </Col>
            <Col style={{ width:50 }} >
              <Text style={styles.total_amount} >{global.currency}{total_amount}</Text>
            </Col>
          </Row>
          <Divider style={{ backgroundColor: colors.theme_fg_two }} />
        </ScrollView>
        <Footer style={styles.footer} >
          <View style={styles.footer_content}>
            <Button
              onPress={this.select_address}
              title={strings.select_address}
              buttonStyle={styles.select_address}
            />
          </View>
        </Footer>
        <Loader visible={isLoding} />
      </Container>
    );
  }
}

function mapStateToProps(state){
  console.log(state.product.cart_items)
  return{
    cart_items : state.product.cart_items,
    sub_total : state.cart.sub_total,
    promo : state.cart.promo,
    total_amount : state.cart.total_amount,
    promo_amount : state.cart.promo_amount,
    isLoding : state.cart.isLoding,
    delivery_date : state.cart.delivery_date,
    delivery_time: state.cart.delivery_time,
    pickup_date: state.cart.pickup_date,
    pickup_time: state.cart.pickup_time,
  };
}

const mapDispatchToProps = (dispatch) => ({
    subTotal: (data) => dispatch(subTotal(data)),
    total: (data) => dispatch(total(data)),
    calculatePricing: () => dispatch(calculatePricing()),
    selectDate: (data) => dispatch(selectDate(data)),
    selectDeliveryTime: (data) => dispatch(selectDeliveryTime(data)),
    selectPickUpDate: (data) => dispatch(selectPickUpDate(data)),
    selectPickUpTime: (data) => dispatch(selectPickUpTime(data)),
});


export default connect(mapStateToProps,mapDispatchToProps)(Cart);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.theme_bg_two,
  },
  header:{
    backgroundColor:colors.theme_bg_three
  },
  icon:{
    color:colors.theme_fg_two
  },
  small_red_text:{
    color:'red',
    fontSize:12
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
  qty:{
    fontSize:15, 
    color:colors.theme_fg, 
    fontWeight:'bold'
  },
  promotion_applied:{
    fontSize:15, 
    color:colors.theme_fg, 
    fontWeight:'bold'
  },
  choose_promotion:{
    color:colors.theme_fg, 
    fontWeight:'bold'
  },
  change_promo:{
    color:colors.theme_fg, 
    fontSize:13
  },
  sub_total:{
    paddingLeft:20, 
    paddingRight:20, 
    paddingTop:10
  },
  discount:{
    paddingLeft:20, 
    paddingRight:20, 
    paddingTop:10
  },
  total:{
    paddingLeft:20, 
    paddingRight:20, 
    paddingTop:10, 
    paddingBottom:10
  },
  total_amount:{
    fontWeight:'bold', 
    color:colors.theme_fg_two
  },
  delivery_date:{
    padding:20, 
    justifyContent:'center'
  },
  delivery_date_text:{
    color:colors.theme_fg, 
    marginBottom:20
  },
  footer:{
    backgroundColor:'transparent'
  },
  footer_content:{
    width:'90%'
  },
  select_address:{
    backgroundColor:colors.theme_bg
  }
});

