import { View, Text, FlatList, Image, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'
import SearchInput from '@/components/SearchInput'
import Trending from '@/components/Trending'
import EmptyState from '@/components/EmptyState'
import ExamCard from '@/components/ExamCard'
import { loadExams } from '../../utils/loadExams';
import {Exam} from '../../types/exam';


const Home = () => {
  const [refreshing, setrefreshing] = useState(false)
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      try {
        // In a real app, you might fetch from an API here
        const data = loadExams();
        setExams(data);
      } catch (error) {
        console.error('Error loading exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" />
    </View>
    );
  }

  const onRefresh = async () => {
    setrefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setrefreshing(false);
  }

  return (
    <SafeAreaView className='bg-primary'>
      <FlatList
        data={exams}
        //data={[{ id: 1, title:'COMP2711', professor:'Prof. Leung', icon:images.comp }, { id: 2, title:'COMP3711', professor:'Prof. Chan', icon:images.comp }, { id: 3, title:'MATH2111', professor:'Prof. Wong', icon:images.cal}]}
        //data={[]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ExamCard 
            id={item.id}
            code={item.code}
            title={item.title}
            professor={item.professor}
            icon={item.icon}
            schedule={item.schedule}
            location={item.location}
          />
        )}
        ListHeaderComponent={() => (
          <View className='my-6 px-6 space-y-6'>
            <View className='justify-between items-start flex-row mb-6'>
              <View>
                <Text className='font-pmedium text-sm text-black-200'>
                  Welcome Back
                </Text>
                <Text className='text-2xl font-psemibold text-black'>
                  Stan
                </Text>
              </View>
              <View className='mt-1.5'>
                <Image 
                  source={images.logoSmall}
                  className = 'w-9 h-10'
                  resizeMode='contain'
    
                />
              </View>
            </View>
            <SearchInput />

            <View className='w-full flex-1 pt-6 pb-1'>
              <Text className='text-black text-xl font-bold'>
                Your Exams
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={ () => (
           <EmptyState
              title='No Exams Found'
          />
        )}
        refreshControl={<RefreshControl refreshing = {refreshing} onRefresh={onRefresh}/>}
      />
    </SafeAreaView>
  )
}

export default Home