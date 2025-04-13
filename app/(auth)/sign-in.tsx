import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'
import FormField from '@/components/FormField'
import CustomButton from '@/components/CustomButton'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_CONFIG, createApiUrl } from '@/config'

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
      // Log the API URL and request body for debugging
      const apiUrl = createApiUrl('login');
      console.log('API Request URL:', apiUrl);
      console.log('Request Body:', JSON.stringify({
        email: form.email,
        password: form.password,
      }));
      
      // Log network info
      console.log('Making API request...');
      
      const loginResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });
      
      console.log('Response status:', loginResponse.status);
      console.log('Response headers:', loginResponse.headers);
      
      const loginData = await loginResponse.json() as LoginResponse;
      console.log('Response data:', loginData);

      if (!loginResponse.ok || !loginData.token) {
        throw new Error(loginData.error || 'Login failed');
      }

      // Store all necessary data
      await AsyncStorage.multiSet([
        ['token', loginData.token],
        ['user_id', loginData.user_id],
        ['user_role', loginData.role.toString()],
      ]);

      router.push('/(tabs)/home');

    } catch (error) {
      console.error('Login process error:', error);
      
      // Add more detailed error logging
      if (error instanceof TypeError && error.message === 'Network request failed') {
        console.log('Network request failed. This may be due to:');
        console.log('1. Incorrect API URL or server is not running');
        console.log('2. The device is not connected to the internet');
        console.log('3. Running on an emulator that cannot access localhost');
        console.log('4. CORS issues (if using a web browser)');
        
        // Check if running in Expo Go
        console.log('Running in Expo environment:', __DEV__ ? 'Yes (Development)' : 'No (Production)');
      }
      
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
          
          {/* Debug button to test API connectivity */}
          {__DEV__ && (
            <CustomButton 
              title="Test API Connection"
              handlePress={() => {
                console.log('Testing API connection to:', createApiUrl(''));
                fetch(createApiUrl(''))
                  .then(res => console.log('API Test connection successful:', res.status))
                  .catch(err => console.log('API Test connection failed:', err));
              }} 
              containerStyles='mt-3 bg-gray-500' 
              textStyles={undefined} 
              isLoading={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn