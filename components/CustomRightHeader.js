import { View, TouchableOpacity } from 'react-native'
import React from 'react'

import { logOut } from '../toolkit/services/AuthSlice';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


export default function CustomHeaderRight() {
    
  const dispatch= useDispatch()
  const navigation= useNavigation()
    return (
      <View >
        
      </View>
    );
  }
  
