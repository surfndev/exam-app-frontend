// SearchInput.tsx
import { View, TextInput, Image } from 'react-native'
import React, { memo, useRef, useState } from 'react'
import { icons } from '../constants'

interface SearchInputProps {
  onSubmitEditing: (text: string) => void;  // Changed to pass the text value
}

const SearchInput = memo(({ onSubmitEditing }: SearchInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<TextInput | null>(null);

  const handleSubmit = () => {
    onSubmitEditing(inputValue);
  };

  return (
    <View className='border-2 border-gray-600 w-full h-16 px-4 bg-black-100 rounded-2xl items-center flex-row focus:border-secondary mt-2'>
      <TextInput 
        ref={inputRef}
        className="flex-1 text-white font-pregular mt-0.5 text-base"
        value={inputValue}
        placeholder='Search your exam'
        placeholderTextColor='#7b7b8b'
        onChangeText={setInputValue}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        editable={true}
        autoCorrect={false}
      />
      <Image 
        source={icons.search}
        className='w-5 h-5'
        resizeMode='contain'
      />
    </View>
  )
})

export default SearchInput