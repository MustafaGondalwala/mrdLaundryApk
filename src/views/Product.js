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
import {  subTotal } from '../actions/CartActions';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
import strings from "../languages/strings.js";


class Product extends Component<Props> {

  constructor(props) {
      super(props)
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
      this.state = {
        service_id:this.props.route.params.id,
        service_name:this.props.route.params.service_name
      }
  }

async componentDidMount(){
  this._unsubscribe=this.props.navigation.addListener('focus',()=>{
    this.Product();
  });
}

componentWillUnmount(){
  this._unsubscribe();
}

Product = async () => {
  this.props.serviceActionPending();
  await axios({
    method: 'post', 
    url: api_url + product,
    data:{ service_id: this.state.service_id, lang: global.lang }
  })
  .then(async response => {
      await this.props.serviceActionSuccess(response.data)
  })
  .catch(error => {
    alert(JSON.stringify(error));
      this.props.serviceActionError(error);
  });
}

  handleBackButtonClick= () => {
      this.props.navigation.goBack(null);
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

  // cart = () => {
  //   this.props.navigation.navigate('PickUpDelivery');
  // }
  cart = async () => {
    await this.props.navigation.navigate('PickUpDelivery',{ id:1, service_name:"Dry Cleas,s,s,s,s,s,s,ning" });
  }


  render() {

    const { isLoding, error, data, message, status, cart_items, cart_count, navigation } = this.props
    
    return (
      <Container>
        <Header androidStatusBarColor={colors.theme_bg} style={styles.header} >
          <Left style={{ flex: 1 }} >
            <Icon onPress={this.handleBackButtonClick} style={styles.icon} name='arrow-back' />
          </Left>
          <Body style={styles.header_body} >
            <Title style={styles.title} >{this.state.service_name}</Title>
          </Body>
          <Right />
        </Header>
        { data != 0 && data != undefined && 
          <Tabs tabBarUnderlineStyle={{ backgroundColor:colors.theme_bg_three }}> 
            {data.map((row, index) => (
                <Tab heading={row.category_name} tabStyle={{backgroundColor: colors.theme_bg }} activeTabStyle={{backgroundColor: colors.theme_bg}} activeTextStyle={{color: colors.theme_bg_three, fontWeight: 'bold'}}>
                    <ScrollView>
                      <List>
                        <FlatList
                          data={row.product}
                          renderItem={({ item,index }) => (
                            <ListItem>
                              <Row style={{ padding:10 }} >
                                <Col style={{ width:100 }} >
                                  <View style={styles.image_container} >
                                    <Image
                                      style= {{flex:1 , width: undefined, height: undefined}}
                                      source={{uri : img_url + item.image }}
                                    />
                                  </View>
                                </Col>
                                <Col style={{ width:100 }}>
                                  <Text style={styles.price} >{"Rs. "}{item.price}/</Text>
                                  <Text style={styles.piece} >Piece</Text>
                                </Col>
                                <Col>
                                  <Text style={styles.product_name} >{item.product_name}</Text>
                                  <View style={{ marginTop:10 }} >
                                    <UIStepper
                                      onValueChange={(value) => { this.add_to_cart(value,item.id,item.product_name,item.price) }}
                                      displayValue={true}
                                      initialValue={cart_items[this.state.service_id + '-' + item.id] ? cart_items[this.state.service_id + '-' + item.id].qty : 0 }
                                      borderColor="#115e7a"
                                      textColor="#115e7a"
                                      tintColor="#115e7a"
                                    />
                                  </View>
                                </Col>
                                
                              </Row>
                            </ListItem>
                          )}
                          keyExtractor={item => item.faq_name}
                        />
                      </List>
                    </ScrollView>
                </Tab>
            ))}
          </Tabs>
        }
        {data == 0 && <Body style={{ marginTop:height_30 }} >
            <Text>{no_data}</Text>
          </Body>}
        {cart_count ?
          <Footer style={styles.footer} >
            <TouchableOpacity activeOpacity={1} onPress={() => this.cart()} style={styles.footer_container}>
              <Row>
                <Col style={styles.view_cart_container} >
                  <Text style={styles.view_cart} >{strings.select_delivery_pickup}</Text>
                </Col>
              </Row>
            </TouchableOpacity>
          </Footer> : null }
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
    sub_total : state.cart.sub_total
  };
}

const mapDispatchToProps = (dispatch) => ({
    serviceActionPending: () => dispatch(serviceActionPending()),
    serviceActionError: (error) => dispatch(serviceActionError(error)),
    serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data)),
    addToCart: (data) => dispatch(addToCart(data)),
    subTotal: (data) => dispatch(subTotal(data))
});


export default connect(mapStateToProps,mapDispatchToProps)(Product);

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
  }
});

