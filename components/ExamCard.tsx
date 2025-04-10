import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { images, icons } from '../constants'
import { router } from 'expo-router'

type ExamCardProps = {
  id: number; // Add this
  title: string;
  professor: string;
  icon: number | { uri: string };
  code: string;
  schedule: string;
  location: string;
};

const ExamCard = ({id, 
  code, 
  title, 
  professor, 
  icon, 
  schedule, 
  location }: ExamCardProps) => {
  return (
    <View className="flex flex-col items-center px-4 mb-10">
      <View className="flex flex-row gap-3 items-start">
        <View className="flex justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
            <Image
              source={icon}
              className="w-full h-full rounded-lg"
              resizeMode='contain'
            />
          </View>

          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="font-psemibold text-sm text-black"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-black font-pregular"
              numberOfLines={1}
            >
              {professor}
            </Text>
          </View>
        </View>

        <View className="pt-2">
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </View>
      </View>
        <TouchableOpacity
          className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
          onPress={() => router.push(`/check-in/${id}`)}
        >
          <Image
            source={images.thumbnail}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />  
        </TouchableOpacity>
    </View>
  )
}

export default ExamCard