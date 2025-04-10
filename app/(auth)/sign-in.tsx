import { View, Text, ScrollView, Image} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {images} from '../../constants'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { router } from 'expo-router'


const SignIn = () => {
  const [form, setForm] = useState({
    email:'',
    password:'',
  })

const [isSubmitting, setisSubmitting] = useState(false)

const submit = () => {

}

  return (
    <SafeAreaView className='bg-primary h-full'>
      <ScrollView>
        <View className="w-full justify-center min-h-[80vh] px-4 my-6">
          <Image source={images.logo} 
            resizeMode='contain' className='w-[115px] h-[35px]'
          />
          <Text className='text-xl text-black text-semibold mt-10 font-psemibold'> Log in to Watch4u</Text>
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email:e})}
            otherStyles="mt-7"
            placeholder='Enter your email'
            keyboardType="email-address"
          />
         <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password:e})}
            otherStyles="mt-7"
            keyboardType="password"
            placeholder='Enter your password'
          />
          <CustomButton title='Sign In' handlePress={() => router.push('/(tabs)/home')} containerStyles='mt-7' textStyles={undefined} isLoading={isSubmitting}/>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn