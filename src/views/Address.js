import React, {Component} from 'react';
import { Platform, StyleSheet, Text, View, TextInput, Image, Keyboard, PermissionsAndroid,Picker } from 'react-native';
import { Container, Header, Content, Left, Body, Right, Title, Icon, Footer } from 'native-base';
import { Button } from 'react-native-elements';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { height_50, GOOGLE_KEY, LATITUDE_DELTA, LONGITUDE_DELTA, api_url, address, pin,all_landmark } from '../config/Constants';
import Snackbar from 'react-native-snackbar';
import { serviceActionPending, serviceActionError, serviceActionSuccess, editServiceActionPending, editServiceActionError, editServiceActionSuccess, updateServiceActionPending, updateServiceActionError, updateServiceActionSuccess } from '../actions/AddressActions';
import axios from 'axios';
import { connect } from 'react-redux';
import { Loader } from '../components/GeneralComponents';
import * as colors from '../assets/css/Colors';
import Geolocation from '@react-native-community/geolocation';
import strings from "../languages/strings.js";

class Address extends Component<Props> {

  constructor(props) {
      super(props)
      this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
      this.state = {
        address: strings.please_select_your_location,
        door_no:'',
        landmark:"",
        sublandmark:"",
        mapRegion: null,
        validation:true,
        address_id:this.props.route.params.id,
        open_map:0,
        server_data:"",
        sublandmarkArr:[]
      }

  }

  add_address = async () => {
    Keyboard.dismiss();
    await this.checkValidate();
    console.log({ customer_id: global.id, address: this.state.address.toString(), door_no: this.state.door_no, latitude: this.state.latitude, longitude: this.state.longitude,landmark_id:this.state.landmark,sublandmark_id:this.state.sublandmark })
    if(this.state.validation){
        this.props.serviceActionPending();
        console.log()
        await axios({
          method: 'post', 
          url: api_url + address,
          data:{ customer_id: global.id, address: this.state.address.toString(), door_no: this.state.door_no, latitude: this.state.latitude, longitude: this.state.longitude,landmark:this.state.landmark,sublandmark_id:this.state.sublandmark }
        })
        .then(async response => {
           console.log(response.data)
            await this.props.serviceActionSuccess(response.data);
            await this.redirect(response.data);
        })
        .catch(error => {
          console.log(error.response)
            this.showSnackbar(strings.sorry_something_went_wrong);
            this.props.serviceActionError(error);
        });
    }
  }

  redirect = async (data) =>{
    if(data.status == 1){
     this.handleBackButtonClick();
    }else{
      alert(data.message);
    }
  }

  checkValidate(){
    if(this.state.door_no == '' ){
      this.state.validation = false;
      this.showSnackbar(strings.please_enter_door_number);
      return true;
    }else if(this.state.address == strings.please_select_your_location ){
      this.state.validation = false;
      this.showSnackbar(strings.please_select_your_location_in_map);
      return true;
    }else if(this.state.landmark == ""){
      this.state.validation = false;
      this.showSnackbar(strings.please_enter_landmark);
      return true
    }
    else{
      this.state.validation = true;
    }
    
  }

  showSnackbar(msg){
    Snackbar.show({
      text:msg,
      duration: Snackbar.LENGTH_SHORT,
    });
  }

  handleBackButtonClick= () => {
      this.props.navigation.goBack(null);
  }

  async componentDidMount() {   
    
    if(Platform.OS === "ios"){
       await this.findType();
    }else{
       await this.requestCameraPermission();
    }

    await axios({
      url:api_url+all_landmark,
      method: 'post', 
      data:{city:"mehsana"}
    }).then(async response => {
      var server_data = response.data.success
      await this.setState({
        server_data
      })
    })
    
  }

  async requestCameraPermission() {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,{
                'title': strings.location_access_required,
                'message': strings.rith_laundry_needs_to_access_your_location_for_tracking
            }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            await this.findType();
        } else {
           await this.handleBackButtonClick();
        }
    } catch (err) {
        console.log(err)
        //await this.handleBackButtonClick();
    }
  }

  async findType(){
    if(this.state.address_id == 0){
      await this.getInitialLocation();
    }else{
      await this.edit_address();
    }
  }

  edit_address = async () => {
    this.props.editServiceActionPending();
    await axios({
      url:api_url+all_landmark,
      method: 'post', 
      data:{city:"mehsana"}
    }).then(async response => {
      var server_data = response.data.success
      await this.setState({
        server_data
      })
    })

    await axios({
      method: 'get', 
      url: api_url+address+'/'+this.state.address_id+'/edit' ,
    })
    .then(async response => {
        await this.props.editServiceActionSuccess(response.data);
        console.log(response.data)
        await this.setState({ open_map:1,
          landmark:response.data.result.landmark, },() => {
            // console.log(this.state)
          })
        await this.setLocation();
    })
    .catch(error => {
        this.showSnackbar(strings.sorry_something_went_wrong);
        this.props.editServiceActionError(error);
    });
  }

  setLocation(){
    let region = {
      latitude: parseFloat(this.props.data.latitude),
      longitude: parseFloat(this.props.data.longitude),
      latitudeDelta:  LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA
    }
    this.setState({ address : this.props.data.address, door_no : this.props.data.door_no, mapRegion: region })
  }

  update_address = async () => {
    Keyboard.dismiss();
    await this.checkValidate();
    if(this.state.validation){
        this.props.updateServiceActionPending();
        await axios({
          method: 'patch', 
          url: api_url+address+'/'+this.state.address_id,
          data:{ customer_id: global.id, address: this.state.address.toString(), door_no: this.state.door_no, latitude: this.state.latitude, longitude: this.state.longitude,landmark:this.state.landmark }
        })
        .then(async response => {
            await this.props.updateServiceActionSuccess(response.data);
            await this.redirect(response.data);
        })
        .catch(error => {
            this.showSnackbar(strings.sorry_something_went_wrong);
            this.props.updateServiceActionError(error);
        });
    }
  }

  async getInitialLocation(){

    await Geolocation.getCurrentPosition( async(position) => {
      this.setState({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      let region = {
        latitude:       await position.coords.latitude,
        longitude:      await position.coords.longitude,
        latitudeDelta:  LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
      this.setState({ mapRegion: region, open_map:1 });
      
    }, error => console.log(error) , 
    {enableHighAccuracy: false, timeout: 10000 });
  }


  onRegionChange = async(value) => {
    this.setState({ address : strings.please_wait });
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + value.latitude + ',' + value.longitude + '&key=' + GOOGLE_KEY)
        .then((response) => response.json())
        .then(async(responseJson) => {
           if(responseJson.results[0].formatted_address != undefined){
              this.setState({ address : responseJson.results[0].formatted_address, latitude: value.latitude, longitude: value.longitude });
           }else{
              this.setState({ address : strings.sorry_something_went_wrong });
           }
    }) 
  }
  changeSubLandMark = async(landmark) => {
    this.setState({
      landmark,
      sublandmark:""
    })
    var getItemData = this.state.server_data.filter(item => item.id == landmark)[0];
    var sublandmarkArr = []
    if(getItemData.sublandmark.length > 0){
      getItemData.sublandmark.map(item => {
        var showValue = item.landmark_name
        console.log(global.lang)
        if(global.lang == "gj")
          showValue = item.landmark_name_gj
        if(global.lang == "hi")
          showValue = item.landmark_name_hi
          sublandmarkArr.push({label:showValue,value:item.id})
      })
    }
    this.setState({
      sublandmarkArr
    })
  }

  render() {

    const { isLoding } = this.props

    return (
      <Container keyboardShouldPersistTaps='always' style={{ backgroundColor: colors.theme_bg_three }} > 
        <Header androidStatusBarColor={colors.theme_bg} style={styles.header} >
          <Left style={{ flex: 1 }} >
            <Icon onPress={this.handleBackButtonClick} style={styles.icon} name='arrow-back' />
          </Left>
          <Body style={styles.header_body} >
            <Title style={styles.title} >{strings.create_address}</Title>
          </Body>
          <Right />
        </Header>
        
        {this.state.open_map == 1 && <Content keyboardShouldPersistTaps='always'>
          <View style={styles.content} >
           <MapView
               provider={PROVIDER_GOOGLE} 
               style={styles.map}
               initialRegion={ this.state.mapRegion }
               onRegionChangeComplete={(region) => {
                  this.onRegionChange(region); 
               }}
            >
            </MapView>
            <View style={styles.location_markers}>
              <View style={styles.pin} >
                <Image
                  style= {{flex:1 , width: undefined, height: undefined}}
                  source={pin}
                />
              </View>
            </View>
            <View style={styles.address_content} >
            <View style={{ flexDirection:'row' }} >
              <Left>
                <Text style={styles.landmark_label} >{strings.door_number}</Text>
              </Left>
            </View> 
            <View style={styles.landmark_content} >
              <TextInput 
                style={styles.landmark_text}
                onChangeText={ TextInputValue =>
                  this.setState({door_no : TextInputValue }) }
                value={this.state.door_no}
              />
            </View>
            <View style={{ marginTop:20 }} />
            <View style={{ flexDirection:'row' }} >
              <Left>
                <Text style={styles.landmark_label} >{strings.landmark}</Text>
              </Left>
            </View> 
            <View style={styles.landmark_content}>
              <Picker
                selectedValue={this.state.landmark}
                style={{height: 50, width: 300, color:colors.theme_fg_two}}
                onValueChange={(itemValue, itemIndex) =>
                this.changeSubLandMark(itemValue)
                }>
                <Picker.Item value="" label="-- Select --"/>
                {
                  this.state.server_data != "" && this.state.server_data.map(item => {
                    var showValue = item.landmark_name
                    if(global.lang == "gj")
                      showValue = item.landmark_name_gj
                    if(global.lang == "hi")
                      showValue = item.landmark_name_hi
                      return <Picker.Item value={item.landmark_name} label={showValue}/>
                  })
                }
              </Picker>
            </View>

            <View style={{ flexDirection:'row' }} >
              <Left>
                <Text style={styles.address_label} >{strings.address}</Text>
              </Left>
            </View> 
            <View style={{ flexDirection:'row' }} >
              <Left>
                <Text style={styles.address_text} >
                  {this.state.address}
                </Text>
              </Left>
            </View>
          </View>
          </View>
            
        </Content>}
        {this.state.open_map == 1 && <Footer style={styles.footer} >
          <View style={styles.footer_content}>
            <Button
              title={strings.done}
              onPress={ this.state.address_id != 0 ? this.update_address : this.add_address}
              buttonStyle={styles.done}
            />
          </View>
        </Footer>}
        <Loader visible={isLoding} />
      </Container>

    );
  }
}

function mapStateToProps(state){
  return{
    isLoding : state.address.isLoding,
    message : state.address.isLoding,
    status : state.address.isLoding,
    data : state.address.data
  };
}

const mapDispatchToProps = (dispatch) => ({
    serviceActionPending: () => dispatch(serviceActionPending()),
    serviceActionError: (error) => dispatch(serviceActionError(error)),
    serviceActionSuccess: (data) => dispatch(serviceActionSuccess(data)),
    editServiceActionPending: () => dispatch(editServiceActionPending()),
    editServiceActionError: (error) => dispatch(editServiceActionError(error)),
    editServiceActionSuccess: (data) => dispatch(editServiceActionSuccess(data)),
    updateServiceActionPending: () => dispatch(updateServiceActionPending()),
    updateServiceActionError: (error) => dispatch(updateServiceActionError(error)),
    updateServiceActionSuccess: (data) => dispatch(updateServiceActionSuccess(data))
});

export default connect(mapStateToProps,mapDispatchToProps)(Address);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
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
  map: {
    width:'100%',
    height:height_50
  },
  location_markers: {
    position: 'absolute',
  },
  content: {
    alignItems:'center', 
    justifyContent:'center'
  },
  pin:{
    height:30, 
    width:25, 
    top:-105 
  },
  address_content:{
    width:'100%', 
    padding:20, 
    backgroundColor:colors.theme_bg_three, 
    marginBottom:10 
  },
  landmark_label:{
    fontSize:15, 
    fontWeight:'bold', 
    color:colors.theme_fg_two 
  },
  landmark_content:{
    width:'100%', 
    marginTop:5 
  },
  landmark_text:{
    borderColor: colors.theme_fg, 
    borderBottomWidth: 1, 
    padding:10, 
    borderRadius:5, 
    height:40 
  },
  address_label:{
    fontSize:15, 
    fontWeight:'bold', 
    color:colors.theme_fg_two
  },
  address_text:{
    fontSize:15, 
    marginTop:5 
  },
  footer:{
    backgroundColor:colors.theme_bg_three
  },
  footer_content:{
    width:'90%', 
    justifyContent:'center'
  },
  done:{
    backgroundColor:colors.theme_bg
  }
});