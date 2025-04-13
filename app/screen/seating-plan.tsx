import { View, Text, Pressable, Alert, ActivityIndicator, Dimensions } from 'react-native'
import React, { useState, useEffect, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import NfcManager, { NfcTech } from 'react-native-nfc-manager'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useSharedValue,
  interpolate,
  withTiming,
} from 'react-native-reanimated'
import { PanGestureHandler } from 'react-native-gesture-handler'


const BASE_URL = 'http://192.168.0.101:8000'
const API_URL = `${BASE_URL}/api/v1`

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const SWIPE_THRESHOLD = 120;

interface UserData {
  id: string;
  email: string;
  seat: string | null;
  tag_serial_number: string | null;
  check_in_time: string | null;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const UserCard = ({ 
  user,
  style,
  onRegister 
}: {
  user: UserData;
  style?: any;
  onRegister: () => void;
}) => {
  return (
    <Animated.View 
      style={[style]}
      className="bg-white rounded-3xl shadow-lg"
    >
      <View className="p-6">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-psemibold text-gray-900">
              {user.email.split('@')[0]}
            </Text>
            <Text className="text-base text-gray-500">
              {user.email}
            </Text>
          </View>
          <View className={`px-4 py-2 rounded-full ${user.check_in_time ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Text className={`${user.check_in_time ? 'text-green-600' : 'text-gray-600'} font-pmedium`}>
              {user.check_in_time ? 'Checked-in' : 'Not checked-in'}
            </Text>
          </View>
        </View>

        <View className="space-y-4 mb-8">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={24} color="#666" />
            <Text className="ml-3 text-lg text-gray-700">
              Seat: {user.seat || 'Not assigned'}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="card-outline" size={24} color="#666" />
            <Text className="ml-3 text-lg text-gray-700">
              Tag: {user.tag_serial_number || 'Not registered'}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onRegister}
          className="bg-secondary py-4 px-6 rounded-xl"
        >
          <Text className="text-white text-center font-psemibold text-lg">
            Register NFC Tag
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};
const SeatingPlan = () => {
  const params = useLocalSearchParams();
  const [users, setUsers] = useState<UserData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  // Single animation value for transition
  const translateX = useSharedValue(0);

  // Animation style
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: CARD_WIDTH,
    position: 'absolute',
  }));

  const handlePrevious = () => {
    if (currentIndex > 0) {
      // Animate card from left to right
      translateX.value = -SCREEN_WIDTH;
      translateX.value = withSpring(0);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < users.length - 1) {
      // Animate card from right to left
      translateX.value = SCREEN_WIDTH;
      translateX.value = withSpring(0);
      setCurrentIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize NFC
        const isSupported = await NfcManager.isSupported();
        if (isSupported) {
          await NfcManager.start();
        } else {
          Alert.alert('Error', 'NFC is not supported on this device');
        }
        
        // Fetch initial user list
        await fetchUserList();
      } catch (error) {
        console.error('Error initializing:', error);
        Alert.alert('Error', 'Failed to initialize the app');
      }
    };
  
    initializeApp();
  
    // Cleanup NFC when component unmounts
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []); // Empty dependency array means this runs once when component mounts
  
  // Optional: Add this if you want to refresh the list periodically or after certain actions
  useEffect(() => {
    // Refresh user list every 30 seconds
    const intervalId = setInterval(() => {
      fetchUserList();
    }, 30000);
  
    return () => clearInterval(intervalId);
  }, []);
  

  const fetchUserList = async () => {
    console.log('Fetching user list...'); // Debug log
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token); // Debug log
      
      if (!token) throw new Error('No token found');
  
      const url = `${API_URL}/exam/${params.id}/user_list`;
      console.log('Fetching from URL:', url); // Debug log
  
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Response status:', response.status); // Debug log
  
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText); // Debug log
        throw new Error('Failed to fetch user list');
      }
  
      const data: UserData[] = await response.json();
      console.log('Received data:', data); // Debug log
      
      // Sort users by seat number
      const sortedUsers = data.sort((a, b) => {
        if (!a.seat && !b.seat) return 0;
        if (!a.seat) return 1;
        if (!b.seat) return -1;
        return a.seat.localeCompare(b.seat);
      });
  
      setUsers(sortedUsers);
      console.log('Users set successfully'); // Debug log
    } catch (error) {
      console.error('Error fetching user list:', error);
      Alert.alert('Error', 'Failed to load user list');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const readNdef = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      return tag?.id || null;
    } catch (ex) {
      console.warn('Ex in readNdef', ex);
      return null;
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => { });
    }
  };

  const registerTag = async (userId: string, tagId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${API_URL}/exam/${params.id}/set_tag`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          tag_serial_number: tagId
        })
      });

      if (!response.ok) throw new Error('Failed to register tag');

      // Refresh user list after successful registration
      await fetchUserList();
      Alert.alert('Success', 'Tag registered successfully');
    } catch (error) {
      console.error('Error registering tag:', error);
      Alert.alert('Error', 'Failed to register tag');
    }
  };

  const handleRegister = async () => {
    if (!users[currentIndex]) return;
    
    setIsScanning(true);
    try {
      const tagId = await readNdef();
      if (tagId) {
        await registerTag(users[currentIndex].id, tagId);
      }
    } catch (error) {
      console.error('Error in handleRegister:', error);
      Alert.alert('Error', 'Failed to read NFC tag');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()}
              className="ml-4"
            >
              <AntDesign name="arrowleft" size={24} color="black" />
            </Pressable>
          ),
        }} 
      />
      
      <SafeAreaView className="flex-1 bg-primary">
        {/* Adjust top padding */}
        <View className="px-6 pt-12 mb-8">
          <Text className="text-2xl font-psemibold text-black mb-3">
            Register NFC Tags
          </Text>
          <Text className="text-sm font-pmedium text-gray-600">
            Use arrows to navigate between users
          </Text>
        </View>
  
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#8A2BE2" />
          </View>
        ) : (
          <View className="flex-1">
            {/* Main content container with padding */}
            <View className="flex-1 px-4 pb-32">
              {/* Card container */}
              <View className="flex-1 justify-center items-center">
                {users[currentIndex] && (
                  <UserCard
                    user={users[currentIndex]}
                    style={cardStyle}
                    onRegister={handleRegister}
                  />
                )}
              </View>
            </View>
  
            {/* Navigation container */}
            <View className="absolute bottom-0 left-0 right-0 h-32 bg-primary">
              <View className="flex-row justify-center items-center space-x-8 mb-4">
                <Pressable 
                  onPress={handlePrevious}
                  disabled={currentIndex === 0}
                  className={`p-4 rounded-full ${currentIndex === 0 ? 'opacity-50' : ''}`}
                >
                  <AntDesign name="leftcircle" size={40} color="#8A2BE2" />
                </Pressable>
                
                <Pressable 
                  onPress={handleNext}
                  disabled={currentIndex === users.length - 1}
                  className={`p-4 rounded-full ${currentIndex === users.length - 1 ? 'opacity-50' : ''}`}
                >
                  <AntDesign name="rightcircle" size={40} color="#8A2BE2" />
                </Pressable>
              </View>
  
              {users.length > 0 && (
                <Text className="text-center text-gray-600 mb-6">
                  {`${currentIndex + 1} of ${users.length}`}
                </Text>
              )}
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default SeatingPlan;