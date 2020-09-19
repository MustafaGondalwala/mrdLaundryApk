import LocalizedStrings from 'react-native-localization';
import AsyncStorage from '@react-native-community/async-storage';

import en from "../languages/en.json";
import gj from "../languages/gj.json";
import hi from "../languages/hi.json";
let strings = new LocalizedStrings({en:en,hi:hi,gj:gj});

export default strings;