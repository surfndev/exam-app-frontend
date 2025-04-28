import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_CONFIG, createApiUrl } from '@/config'

//python manage.py runserver 0.0.0.0:8000
//const BASE_URL = 'http://192.168.0.101:8000'
//const API_URL = `${BASE_URL}/api/v1`

interface LoginResponse {
  error: string
  token: string;
  user_id: string;
  role: number;
}

const SignIn = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const loginResponse = await fetch(createApiUrl('login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const loginData = await loginResponse.json() as LoginResponse;

      if (!loginResponse.ok || !loginData.token) {
        throw new Error(loginData.error || 'Login failed');
      }

      // Store all necessary data
      await AsyncStorage.multiSet([
        ['token', loginData.token],
        ['user_id', loginData.user_id],
        ['user_role', loginData.role.toString()],
      ]);

      // Route based on role (0 is student, other numbers are different admin roles)
      if (loginData.role === 0) {
        console.log('Routing to student home', loginData.role);
        router.push('/(tabs)/home');
      } else {
        console.log('Routing to admin home with role:', loginData.role);
        router.push('/(admin)/exams');
      }

      //router.push('/(tabs)/home');

    } catch (error) {
      console.error('Login process error:', error);
      Alert.alert(
        'Error',
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred during login'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className='bg-primary h-full'>
      <ScrollView>
        <View className="w-full justify-center min-h-[80vh] px-4 my-6">
          <Image 
            source={images.logo} 
            resizeMode='contain' 
            className='w-[115px] h-[35px]'
          />
          <Text className='text-xl text-black text-semibold mt-10 font-psemibold'>
            Log in to Watch4u
          </Text>
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e: string) => setForm({ ...form, email: e.trim() })}
            otherStyles="mt-7"
            placeholder='Enter your email'
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e: any) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            keyboardType="password"
            placeholder='Enter your password'
            secureTextEntry={true}
            autoCapitalize="none"
          />
          <CustomButton 
            title={isSubmitting ? 'Signing In...' : 'Sign In'}
            handlePress={handleLogin} 
            containerStyles='mt-7' 
            textStyles={undefined} 
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn