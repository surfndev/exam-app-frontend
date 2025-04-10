import { View, Text, TextInput, TouchableOpacity, Image} from 'react-native'
import React, { useState } from 'react'
import { icons } from '../constants'



const SearchInput = ({title, value, placeholder,handleChangeText, otherStyles, ...props}) => {

  const [showPassowrd, setShowPassword] = useState(false);

  return (
      <View className='border-2 border-gray-600 w-full h-16 px-4 bg-black-100 rounded-2xl items-center flex-row focus:border-secondary mt-2 space-x-4'>
        <TextInput 
            className="flex-1 text-white font-pregular mt-0.5 text-base"
            value={value}
            placeholder= 'Search your exam'
            placeholderTextColor='#7b7b8b'
            onChangeText={handleChangeText}
            secureTextEntry= {title === 'Password' && !showPassowrd}
        />

        <TouchableOpacity>
            <Image 
                source={icons.search}
                className='w-5 h-5'
                resizeMode='contain'
            />
        </TouchableOpacity>
      </View>
    
  )
}

export default SearchInput