// app/check-in/[id].tsx
import { View, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Stack } from 'expo-router';
import { NFCButton } from '../../components/NFCButton';
import { SelfieButton } from '../../components/SelfieButton';
import  ProgressStepper  from '../../components/ProgressStepper';
import { Exam } from '../../types/exam';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

const CheckInScreen = () => {
  const { id } = useLocalSearchParams();
  const [checkInProgress, setCheckInProgress] = useState(0);
  const [isLoading, setIsLoading] = useState({
    nfc: false,
    selfie: false
  });
  
  const examData: Exam = {
    id: Number(id),
    title: "Advanced Programming",
    code: "COMP2711",
    professor: "Prof. Leung",
    icon: require('../../assets/images/comp.png'),
    schedule: "Mon 10:00-12:00",
    location: "Room 402"
  };

  const handleNFCScan = async () => {
    setIsLoading(prev => ({...prev, nfc: true}));
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate NFC scan
    setCheckInProgress(0.5);
    setIsLoading(prev => ({...prev, nfc: false}));
  };

  const handleSelfie = async () => {
    setIsLoading(prev => ({...prev, selfie: true}));
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate selfie capture
    setCheckInProgress(1);
    setIsLoading(prev => ({...prev, selfie: false}));
  };

  return (
    <View className="flex-1 bg-primary p-6">
      <Stack.Screen options={{ 
        headerShown: true,
        headerTitle: 'Check-in',
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#FAFAFA' },
        headerTintColor: 'black',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} className="ml-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        ),
      }} />

      <View className="flex-1">
        <View className="mt-4">
          <Text className="text-xl font-pmedium text-center text-gray-700 mb-4">
            {examData.code} Final Exam
          </Text>
          <ProgressStepper
            progress={checkInProgress}
            steps={['NFC Verify', 'Selfie', 'Complete']}
            activeColor="#8A2BE2"
            inactiveColor="#E5E7EB"
          />
        </View>

        {/* Middle Content Area */}
        <View className="flex-1 justify-center px-4">
          {checkInProgress === 0 && (
            <Text className="text-lg text-center text-gray-900">
              Please scan the NFC tag on your top-right corner of the table.
            </Text>
          )}
          {checkInProgress === 0.5 && (
            <View className="bg-white p-6 rounded-lg">
              <Text className="text-lg text-center text-gray-800 mb-4">
                Take a clear selfie for attendance verification
              </Text>
              <View className="border-2 border-dashed border-secondary rounded-lg p-4 items-center">
                <Ionicons name="camera" size={40} color="#8A2BE2" />
                <Text className="text-gray-500 mt-2">Frame your face here</Text>
              </View>
            </View>
          )}
          {checkInProgress === 1 && (
            <View className="bg-green-100 p-6 rounded-lg items-center">
              <Text className="text-xl font-bold text-green-800">
                Check-in Complete!
              </Text>
              <Text className="text-center mt-2">
                You're checked in for {examData.code} at {examData.location}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Buttons */}
        {checkInProgress < 1 && (
          <View className="space-y-4 mb-6">
            <NFCButton 
              isVerified={checkInProgress > 0}
              isLoading={isLoading.nfc}
              onPress={handleNFCScan}
            />
            <SelfieButton 
              isVerified={checkInProgress === 1}
              isActive={checkInProgress >= 0.5}
              isLoading={isLoading.selfie}
              onPress={handleSelfie}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default CheckInScreen;