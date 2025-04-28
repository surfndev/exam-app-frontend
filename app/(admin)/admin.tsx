import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { createApiUrl } from '@/config';

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: number;
  status: number;
}

// Default user data to handle undefined cases
const defaultUserData: UserData = {
  id: '',
  email: '',
  first_name: '',
  last_name: '',
  role: 0,
  status: 0,
};

const ProfileCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) => (
  <View className="flex-row items-center bg-gray-50 p-4 rounded-xl mb-4">
    {icon}
    <View className="ml-4">
      <Text className="text-gray-500 text-sm">{title}</Text>
      <Text className="text-black font-semibold text-base mt-1">{value}</Text>
    </View>
  </View>
);

const Profile = () => {

  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const token = await AsyncStorage.getItem('token');

      if (!userId || !token) {
        router.replace('/sign-in');
        return;
      }

      const response = await fetch(createApiUrl(`user/${userId}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await handleLogout();
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data[0] || defaultUserData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user_id', 'user_role']);
      router.replace('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const showLogoutConfirmation = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };

  const getUserRole = (role: number): string => {
    return role >= 1 ? 'Staff' : 'Student';
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#8A2BE2" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="items-center pt-8 pb-6">
          <View className="bg-purple-100 rounded-full p-6 mb-4">
          {<AntDesign name="user" size={48} color="#8A2BE2" />}
          </View>
          <Text className="text-2xl font-bold text-center">
            {`${userData.first_name} ${userData.last_name}`}
          </Text>
          <View className="bg-purple-100 px-4 py-2 rounded-full mt-2">
            <Text className="text-purple-700 font-medium">
              {getUserRole(userData.role)}
            </Text>
          </View>
        </View>

        {/* Profile Information */}
        <View className="mb-8">
          <Text className="text-lg font-bold mb-4">Profile Information</Text>
          
          <ProfileCard
            icon={<Entypo name="email" size={24} color="#8A2BE2" />}
            title="Email"
            value={userData.email}
          />
          
          <ProfileCard
            icon={<AntDesign name="infocirlce" size={24} color="#8A2BE2" />}
            title="First Name"
            value={userData.first_name}
          />
          
          <ProfileCard
            icon={<AntDesign name="infocirlce" size={24} color="#8A2BE2" />}
            title="Last Name"
            value={userData.last_name}
          />
          
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={showLogoutConfirmation}
          className="bg-red-500 rounded-xl py-4 px-6 mb-8"
        >
          <View className="flex-row items-center justify-center">
          <AntDesign name="logout" size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-2">
              Logout
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;