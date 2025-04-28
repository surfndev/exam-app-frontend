import { View, Text, FlatList, Image, RefreshControl, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'
import SearchInput from '@/components/SearchInput'
import Trending from '@/components/Trending'
import EmptyState from '@/components/EmptyState'
import ExamCard from '@/components/ExamCard'
import { loadExams } from '../../utils/loadExams';
import { ExamCardProps } from '@/components/ExamCard'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { createApiUrl } from '@/config'

// Add interface for user data
interface UserData {
  id: string;  // Changed from number to string since it's a UUID
  email: string;
  first_name: string;
  last_name: string;
  role: number;
  status: number;
}

const Home = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [exams, setExams] = useState<ExamCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null)
  // Add user state
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token')
      const userId = await AsyncStorage.getItem('user_id')

      if (!storedToken || !userId) {
        router.replace('/sign-in')
        return
      }

      setToken(storedToken)
      
      // Fetch user and exams data in parallel
      await Promise.all([
        fetchUserInfo(storedToken, userId),
        fetchExams(storedToken, userId)
      ])
    } catch (error) {
      console.error('Auth check error:', error)
      router.replace('/sign-in')
    }
  }

  // Add fetchUserInfo function
  const fetchUserInfo = async (authToken: string, userId: string) => {
    try {
      const response = await fetch(createApiUrl(`user/${userId}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })
  
      if (!response.ok) {
        if (response.status === 401) {
          await AsyncStorage.multiRemove(['token', 'user_role', 'user_id'])
          router.replace('/sign-in')
          return
        }
        throw new Error('Failed to fetch user information')
      }
  
      const userData = await response.json()
      // Since the API returns an array, take the first item
      setUser(userData[0])
    } catch (error) {
      console.error('Error fetching user info:', error)
      Alert.alert('Error', 'Failed to load user information')
    }
  }
  

  const fetchExams = async (authToken: string, userId: string) => {
    try {
      const response = await fetch(createApiUrl(`user/${userId}/exam`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })
  
      if (response.status === 401) {
        await AsyncStorage.multiRemove(['token', 'user_role', 'user_id'])
        router.replace('/sign-in')
        return
      }
  
      // If response is 404 (Not Found) or 204 (No Content), set empty array
      if (response.status === 404 || response.status === 204) {
        setExams([])
        return
      }
  
      if (!response.ok) {
        throw new Error('Failed to fetch exams')
      }
  
      const data = await response.json()
      // If the response is successful but empty, set empty array
      setExams(data || [])
    } catch (error) {
      console.error('Error fetching exams:', error)
      // Only show alert for actual errors, not for empty results
      if (error instanceof Error && error.message !== 'Failed to fetch exams') {
        Alert.alert('Error', 'Failed to load exams')
      }
      setExams([]) // Set empty array on error to show EmptyState
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    if (token) {
      const userId = await AsyncStorage.getItem('user_id')
      if (userId) {
        await Promise.all([
          fetchUserInfo(token, userId),
          fetchExams(token, userId)
        ])
      }
    }
    setRefreshing(false)
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#8A2BE2" />
      </View>
    )
  }

  return (
    <SafeAreaView className="bg-primary flex-1">
      <FlatList
        data={exams}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ExamCard
            {...item}
            isAdmin={true}
          />
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-6 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-black-200">
                  Student Dashboard
                </Text>
                <Text className="text-2xl font-psemibold text-black">
                  {/* Display user's name */}
                  Welcome {user?.first_name || 'Student'}
                </Text>
              </View>
              <View className="mt-1.5">
                <Image
                  source={images.logoSmall}
                  className="w-9 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>

            <SearchInput />

            <View className="flex-row justify-between items-center mt-5">
              <Text className="text-black text-xl font-bold font-pregular">
                Your Exams
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Exams Found"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  )
}

export default Home