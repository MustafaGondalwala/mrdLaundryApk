import { Dimensions } from 'react-native';
import strings from "../languages/strings.js";

export const base_url = "http://mrdironingservices.com/";
export const api_url = "http://mrdironingservices.com/api/";
export const settings = "app_setting";
export const img_url = "http://mrdironingservices.com/uploads/";
export const service = "service";
export const faq = "faq";
export const privacy = "privacy_policy";
export const product = "product";
export const register = "customer";
export const login = "customer/login";
export const address = "address";
export const address_list = "address/all";
export const address_delete = "address/delete";
export const my_orders = "get_orders";
export const promo_code = "promo";
export const profile = "customer";
export const profile_picture = "customer/profile_picture";
export const forgot = "customer/forgot_password";
export const reset = "customer/reset_password";
export const place_order = "order";
export const payment_list = "payment";
export const stripe_payment = "stripe_payment";
export const feedback = "feedback";
export const otp = "customer/otp";
export const customer_feedback = "customer_feedback"
export const all_landmark = "landmark"
export const validate_payment = "validate-payment"
export const create_razorpay_order = "create-razorpay-order"

export const razorpay_keyid = "rzp_test_zIFuxhv4YP8TdO"
export const razorpay_secret = "eRYxjnNltrQCLvXKQAqEptVO"


//Size
export const screenHeight = Math.round(Dimensions.get('window').height);
export const height_40 = Math.round(40 / 100 * screenHeight);
export const height_50 = Math.round(50 / 100 * screenHeight);
export const height_60 = Math.round(60 / 100 * screenHeight);
export const height_35 = Math.round(35 / 100 * screenHeight);
export const height_20 = Math.round(20 / 100 * screenHeight);
export const height_30 = Math.round(30 / 100 * screenHeight);

//Path
export const logo_url = "http://mrdironingservices.com/uploads/images/logo.png"
export const logo = require('.././assets/img/logo_with_name.png');
export const forgot_password = require('.././assets/img/forgot_password.png');
export const reset_password = require('.././assets/img/reset_password.png');
export const loading = require('.././assets/img/loading.png');
export const pin = require('.././assets/img/location_pin.png');
export const login_image = require('.././assets/img/logo_with_name.png');
export const washing_machine = require('.././assets/img/washing-machine.png');
export const completed_icon = require('.././assets/img/completed.png');
export const active_icon = require('.././assets/img/active.png');

//Map
export const GOOGLE_KEY = "AIzaSyCrg7ZMhJlHvBg8pH5BcOqqXl89BTH8Jx4";
export const LATITUDE_DELTA = 0.0150;
export const LONGITUDE_DELTA =0.0152;
