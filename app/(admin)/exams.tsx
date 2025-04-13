import { View, Text, FlatList, Image, RefreshControl, ActivityIndicator, Pressable, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'
import SearchInput from '@/components/SearchInput'
import EmptyState from '@/components/EmptyState'
import ExamCard2 from '@/components/ExamCard2'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import type { ExamCard2Props } from '@/components/ExamCard2' // Import the type
import { API_CONFIG, createApiUrl } from '@/config'

//const BASE_URL = 'http://192.168.0.101:8000'
//const API_URL = `${BASE_URL}/api/v1`

const Exams = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [exams, setExams] = useState<ExamCard2Props[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndFetchExams()
  }, [])

  const checkAuthAndFetchExams = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token')
      const userRole = await AsyncStorage.getItem('user_role')

      if (!storedToken) {
        router.replace('/sign-in')
        return
      }

      /*if (!storedToken || userRole === '0') {
        router.replace('/sign-in')
        return
      }*/

      setToken(storedToken)
      await fetchExams(storedToken)
    } catch (error) {
      console.error('Auth check error:', error)
      router.replace('/sign-in')
    }
  }

  const fetchExams = async (authToken: string) => {
    try {
      const response = await fetch(createApiUrl('exam'), {
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
        throw new Error('Failed to fetch exams')
      }

      const data = await response.json()
      setExams(data)
    } catch (error) {
      console.error('Error fetching exams:', error)
      Alert.alert('Error', 'Failed to load exams')
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    if (token) {
      await fetchExams(token)
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
          <ExamCard2
            {...item}
            isAdmin={true}
          />
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-6 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-black-200">
                  Admin Dashboard
                </Text>
                <Text className="text-2xl font-psemibold text-black">
                  Exam Management
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
                All Exams
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Exams Found"
            message="Create your first exam by clicking the Add Exam button"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  )
}

export default Exams