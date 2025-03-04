import React, {Component} from 'react';
import { View, StyleSheet, Text, ScrollView, ImageBackground, TouchableOpacity, Image, Picker, I18nManager,TouchableHighlight} from 'react-native';
import { StatusBar, Loader } from '../components/GeneralComponents';
import { img_url, api_url, service, completed_icon, active_icon } from '../config/Constants';
import * as colors from '../assets/css/Colors';
import axios from 'axios';
import { connect } from 'react-redux';
import { serviceActionPending, serviceActionError, serviceActionSuccess } from '../actions/HomeActions';
import { filterType } from '../actions/MyOrdersActions';
import { productListReset } from '../actions/ProductActions';
import { CommonActions, TabActions } from '@react-navigation/native';
import Slideshow from 'react-native-image-slider-show';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Header, Content, List, ListItem, Left, Body, Right, Title, Col, Card, Row } from 'native-base';
import strings from "../languages/strings.js";
import RNRestart from 'react-native-restart';
import { Badge, Icon, withBadge } from 'react-native-elements'



class Home extends Component<Props>{

  constructor(props) {
      super(props)
      this.state={
        position: 1,
        dataSource:[],
        language : global.lang,
        active_order:0,
        completed_order:0
      }
  }

  

  async componentDidMount(){
    this._unsubscribe=this.props.navigation.addListener('focus',async ()=>{
      this.Service(); 
    });
    
  }

  componentWillUnmount(){
    this._unsubscribe();
  }

  componentWillMount() {
    
    this.setState({
      interval: setInterval(() => {
        this.setState({
          position: this.state.position === this.state.dataSource.length ? 0 : this.state.position + 1
        });
      }, 3000)
    });


  }
 
  product = async (id,service_name) => {
    await this.props.productListReset();
    await this.props.navigation.navigate('Product',{ id:id, service_name:service_name });
  }

  Service = async () => {
    this.props.serviceActionPending();
    await axios({
      method: 'post', 
      url: api_url + service,
      data:{ customer_id : global.id, lang: global.lang }
    })
    .then(async response => {
      this.setState({ dataSource: response.data.banner_images, active_order:response.data.order.active, completed_order:response.data.order.completed });
      await this.props.serviceActionSuccess(response.data)
    })
    .catch(error => {
      this.props.serviceActionError(error);
    });
  }

  async language_change(lang){
    try {
      await AsyncStorage.setItem('lang', lang);
      await strings.setLanguage(lang);
      if(lang == 'ar'){
        await I18nManager.forceRTL(true);
        await RNRestart.Restart();
      }else{
        await I18nManager.forceRTL(false);
        await RNRestart.Restart();
      }
    } catch (e) {

    }
  }

  my_orders = async (type) => {
    await this.props.filterType(type);
    const jumpToAction = TabActions.jumpTo('MyOrders');
    this.props.navigation.dispatch(jumpToAction);
  }

  render() {
    const { isLoding, error, data, message, status } = this.props
    const BadgedIcon = withBadge(10)(Icon);
    var qty = 0;

    Object.keys(this.props.cart_items).map(item =>  qty += this.props.cart_items[item].qty )
    const service_list = data.map((row) => {
      var service_image = img_url + row.image;
      return (
        <Card  style={{ marginRight:10, borderRadius:10, alignItems:'center', justifyContent:'center', backgroundColor:colors.theme_bg_three, padding:10 }}>
          <TouchableOpacity style={{ alignItems:'center', justifyContent:'center' }} activeOpacity={1} onPress={() => this.product(row.id, row.service_name)}>
            <View style={styles.service_icon} >
              <Image
                style= {{flex:1 , width: undefined, height: undefined}}
                source={{ uri : service_image }}
              />
            </View>
            <Text style={{ color:colors.theme_fg_two, fontWeight:'bold' }}>{row.service_name}</Text>
          </TouchableOpacity>
        </Card>
      )
    })

    return (
      <Container>
        <Header androidStatusBarColor={colors.theme_bg} 
            style={styles.header}>
            <Title style={styles.title} >{strings.app_name}</Title>
              <Icon
              name='shopping-bag'
              type='font-awesome-5'
              color='#517fa4'
              size={27}
            />
          <Text style={{padding:5}}>{qty}</Text>
        </Header>
        <Content>
          <Loader visible={isLoding} />
        
          <View>
            <Slideshow 
              arrowSize={0}
              indicatorSize={0}
              scrollEnabled={true}
              position={this.state.position}
              dataSource={this.state.dataSource}/>
          </View>
          <View style={{ padding:20 }}>
            <Text style={{ color:colors.theme_fg_two, fontSize:18, fontWeight:'bold' }}>{strings.are_you_looking_for}</Text>
            <View style={{ margin:10 }} />
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}>
              {service_list}
            </ScrollView>
          </View>
          <View style={{ padding:20 }}>
            <Text style={{ color:colors.theme_fg_two, fontSize:18, fontWeight:'bold' }}>{strings.your_orders}</Text>
            <View style={{ margin:10 }} />
            <Row>
              <Col>
                <Card style={{ marginRight:10, borderRadius:10, alignItems:'center', justifyContent:'center', backgroundColor:colors.theme_bg_three, padding:10 }}>
                  <TouchableOpacity style={{ alignItems:'center', justifyContent:'center' }} activeOpacity={1} onPress={() => this.my_orders(1)}>
                    <View style={styles.orders_icon} >
                      <Image
                        style= {{flex:1 , width: undefined, height: undefined}}
                        source={active_icon}
                      />
                    </View>
                    <View style={{ margin:5 }} />
                    <Text style={{ color:colors.theme_fg_two, fontWeight:'bold' }}>{strings.active_orders} ({this.state.active_order})</Text>
                  </TouchableOpacity>
                </Card>
              </Col>
              <Col>
                <Card style={{ marginRight:10, borderRadius:10, alignItems:'center', justifyContent:'center', backgroundColor:colors.theme_bg_three, padding:10 }}>
                  <TouchableOpacity style={{ alignItems:'center', justifyContent:'center' }} activeOpacity={1} onPress={() => this.my_orders(2)}>
                    <View style={styles.orders_icon} >
                      <Image
                        style= {{flex:1 , width: undefined, height: undefined}}
                        source={completed_icon}
                      />
                    </View>
                    <View style={{ margin:5 }} />
                    <Text style={{ color:colors.theme_fg_two, fontWeight:'bold' }}>{strings.complete_orders} ({this.state.completed_order})</Text>
                  </TouchableOpacity>
                </Card>
              </Col>
            </Row>
          </View>
        </Content>
      </Container>
    )
  }
}

function mapStateToProps(state){
  
  return{
    isLoding : state.home.isLoding,
    error : state.home.error,
    data : state.home.data,
    message : state.home.message,
    status : state.home.status,
    cart_items : state.product.cart_items,
  };
}

const mapDispatchToProps = (dispatch) => ({
    serviceActionPending: () => dispatch(serviceActionPending()),
    serviceActionError: (error) => dispatch(serviceActionError(error)),
    serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data)),
    productListReset: () => dispatch(productListReset()),
    filterType: (data) => dispatch(filterType(data))
});


export default connect(mapStateToProps,mapDispatchToProps)(Home);

const styles = StyleSheet.create({
  service_name:{
    color:colors.theme_bg_three, 
    fontSize:18, 
    fontWeight:'bold'
  },
  service_icon:{
    height:100, 
    width:100 
  },
  orders_icon:{
    height:80, 
    width:80 
  },
  language_icon:{
    height:30, 
    width:30 
  },
  header:{
    backgroundColor:colors.theme_bg_three,
    paddingTop:10
  },
  icon:{
    color:colors.theme_fg_two
  },
  header_body: {
    flex: 3,
    justifyContent: 'center'
  },
  title:{    
    color:colors.theme_fg, 
    fontSize:18, 
    textAlign:'center',
    fontWeight:'bold',
    flex: 1
  },
});
