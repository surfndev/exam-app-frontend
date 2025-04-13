import { View, Text, TextInput, TouchableOpacity, Image} from 'react-native'
import React, { useState } from 'react'
import { icons } from '../constants'



const FormField = ({title, value, placeholder,handleChangeText, otherStyles, ...props}) => {

  const [showPassowrd, setShowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className='text-base text-black-100 font-pmedium ml-1'>{title}</Text>
      <View className='border-2 border-gray-600 w-full h-16 px-4 bg-black-100 rounded-2xl items-center flex-row focus:border-secondary mt-2'>
        <TextInput 
            className="flex-1 text-white font-psemibold text-base"
            value={value}
            placeholder={placeholder}
            placeholderTextColor='#7b7b8b'
            onChangeText={handleChangeText}
            secureTextEntry= {title === 'Password' && !showPassowrd}
        />

        {title === 'Password' && (
            <TouchableOpacity onPress={() => 
                setShowPassword(!showPassowrd)
            }>
                <Image source={!showPassowrd ? icons.eye : icons.eyeHide} className='w-6 h-6' resizeMode='contain' />
            </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default FormField