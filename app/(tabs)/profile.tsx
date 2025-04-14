import { mockCheckIns } from '@/assets/data/mockCheckIns';
import CheckInLog from '@/components/CheckInLog';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const handleLogout = () => {
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      <Stack.Screen 
        options={{
          headerTitle: () => <Text>My Profile</Text>,
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#F2F2F2' },
          headerTintColor: 'black',
        }} 
      />

      <ScrollView className="flex-1">
        <View className="bg-white p-6 rounded-b-3xl shadow-sm">
          <View className="items-center mb-4">
            <View className="w-24 h-24 bg-secondary rounded-full justify-center items-center mb-3">
              <Ionicons name="person" size={40} color="white" />
            </View>
            <Text className="text-xl font-psemibold">John Doe</Text>
            <Text className="text-gray-600">ID: 12345678</Text>
          </View>

          <View className="flex-row justify-between border-t border-gray-100 pt-4">
            <View className="items-center flex-1 min-w-0 px-2">
              <Text className="font-pmedium">Faculty</Text>
              <Text 
                className="text-gray-600 text-center" 
                numberOfLines={1} 
                ellipsizeMode="tail"
              >
                CSE
              </Text>
            </View>
            
            <View className="w-px bg-gray-200 mx-2" />
            
            <View className="items-center flex-1 min-w-0 px-2">
              <Text className="font-pmedium">Program</Text>
              <Text 
                className="text-gray-600 text-center" 
                numberOfLines={1} 
                ellipsizeMode="tail"
              >
                Computer Science
              </Text>
            </View>
          </View>
        </View>

        <View className="p-6">
          <Text className="text-lg font-psemibold mb-4">Recent Check-ins</Text>
          <CheckInLog checkIns={mockCheckIns} />
        </View>
      </ScrollView>

      <View className="p-6 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 p-4 rounded-xl items-center"
          activeOpacity={0.7}
        >
          <Text className="text-white font-psemibold">Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;